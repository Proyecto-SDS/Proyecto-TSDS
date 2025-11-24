"""
Rutas para gestión de usuarios
Endpoints para registro, autenticación y perfil de usuarios
"""

from flask import Blueprint, jsonify, request
from app import db
from app.models import Usuario, Rol, Favorito, Opinion, Reserva
from datetime import datetime

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')


@usuarios_bp.route('/', methods=['GET'])
def get_usuarios():
    """
    Obtener todos los usuarios
    Query params:
    - rol: filtrar por rol (cliente, administrador, mesero, etc.)
    - nombre: buscar por nombre
    """
    rol_nombre = request.args.get('rol')
    nombre = request.args.get('nombre')
    
    query = Usuario.query.join(Rol)
    
    if rol_nombre:
        query = query.filter(Rol.nombre == rol_nombre)
    
    if nombre:
        query = query.filter(Usuario.nombre.ilike(f'%{nombre}%'))
    
    usuarios = query.all()
    
    return jsonify([
        {
            'id': u.id,
            'nombre': u.nombre,
            'correo': u.correo,
            'telefono': u.telefono,
            'rol': u.rol.nombre,
            'creado_el': u.creado_el.isoformat() if u.creado_el else None
        }
        for u in usuarios
    ])


@usuarios_bp.route('/<int:user_id>', methods=['GET'])
def get_usuario(user_id):
    """Obtener información de un usuario específico"""
    usuario = Usuario.query.get_or_404(user_id)
    
    return jsonify({
        'id': usuario.id,
        'nombre': usuario.nombre,
        'correo': usuario.correo,
        'telefono': usuario.telefono,
        'rol': usuario.rol.nombre,
        'creado_el': usuario.creado_el.isoformat() if usuario.creado_el else None,
        'estadisticas': {
            'total_reservas': len(usuario.reservas),
            'total_favoritos': len(usuario.favoritos),
            'total_opiniones': len(usuario.opiniones)
        }
    })


@usuarios_bp.route('/', methods=['POST'])
def create_usuario():
    """Crear un nuevo usuario (registro)"""
    data = request.get_json()
    
    # Validar que el correo no exista
    if Usuario.query.filter_by(correo=data['correo']).first():
        return jsonify({'error': 'El correo ya está registrado'}), 400
    
    # Buscar o crear rol
    rol_nombre = data.get('rol', 'cliente')
    rol = Rol.query.filter_by(nombre=rol_nombre).first()
    if not rol:
        rol = Rol(nombre=rol_nombre)
        db.session.add(rol)
        db.session.flush()
    
    # Crear usuario
    # IMPORTANTE: En producción, la contraseña debe estar hasheada
    usuario = Usuario(
        id_rol=rol.id,
        nombre=data['nombre'],
        correo=data['correo'],
        contrasena=data['contrasena'],  # TODO: Hash con bcrypt
        telefono=data.get('telefono')
    )
    db.session.add(usuario)
    db.session.commit()
    
    return jsonify({
        'id': usuario.id,
        'nombre': usuario.nombre,
        'correo': usuario.correo,
        'mensaje': 'Usuario creado exitosamente'
    }), 201


@usuarios_bp.route('/<int:user_id>/favoritos', methods=['GET'])
def get_favoritos_usuario(user_id):
    """Obtener locales favoritos de un usuario"""
    usuario = Usuario.query.get_or_404(user_id)
    
    favoritos = Favorito.query.filter_by(id_usuario=user_id).all()
    
    return jsonify([
        {
            'id': fav.id,
            'local': {
                'id': fav.local.id,
                'nombre': fav.local.nombre,
                'comuna': fav.local.direccion.comuna.nombre
            },
            'agregado_el': fav.agregado_el.isoformat() if fav.agregado_el else None
        }
        for fav in favoritos
    ])


@usuarios_bp.route('/<int:user_id>/reservas', methods=['GET'])
def get_reservas_usuario(user_id):
    """
    Obtener reservas de un usuario
    Query params:
    - estado: filtrar por estado (pendiente, confirmada, cancelada, completada)
    - fecha_desde: filtrar desde fecha (YYYY-MM-DD)
    - fecha_hasta: filtrar hasta fecha (YYYY-MM-DD)
    """
    usuario = Usuario.query.get_or_404(user_id)
    
    estado = request.args.get('estado')
    fecha_desde = request.args.get('fecha_desde')
    fecha_hasta = request.args.get('fecha_hasta')
    
    query = Reserva.query.filter_by(id_usuario=user_id)
    
    if estado:
        query = query.filter(Reserva.estado == estado)
    
    if fecha_desde:
        fecha = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
        query = query.filter(Reserva.fecha_reserva >= fecha)
    
    if fecha_hasta:
        fecha = datetime.strptime(fecha_hasta, '%Y-%m-%d').date()
        query = query.filter(Reserva.fecha_reserva <= fecha)
    
    reservas = query.all()
    
    return jsonify([
        {
            'id': r.id,
            'local': {
                'id': r.local.id,
                'nombre': r.local.nombre
            },
            'fecha_reserva': str(r.fecha_reserva) if r.fecha_reserva else None,
            'hora_reserva': str(r.hora_reserva) if r.hora_reserva else None,
            'estado': r.estado,
            'creada_el': r.creada_el.isoformat() if r.creada_el else None
        }
        for r in reservas
    ])


@usuarios_bp.route('/<int:user_id>/opiniones', methods=['GET'])
def get_opiniones_usuario(user_id):
    """Obtener opiniones/reseñas escritas por un usuario"""
    usuario = Usuario.query.get_or_404(user_id)
    
    opiniones = Opinion.query.filter_by(id_usuario=user_id).filter(
        Opinion.eliminado_el.is_(None)
    ).all()
    
    return jsonify([
        {
            'id': op.id,
            'local': {
                'id': op.local.id,
                'nombre': op.local.nombre
            },
            'puntuacion': float(op.puntuacion) if op.puntuacion else None,
            'comentario': op.comentario,
            'creado_el': op.creado_el.isoformat() if op.creado_el else None
        }
        for op in opiniones
    ])
