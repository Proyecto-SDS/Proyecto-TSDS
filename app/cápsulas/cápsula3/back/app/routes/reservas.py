"""
Rutas para gestión de reservas
Endpoints para crear, listar y gestionar reservas de mesas
"""

from flask import Blueprint, jsonify, request
from app import db
from app.models import Reserva, ReservaMesa, Local, Usuario, Mesa
from datetime import datetime, date, time

reservas_bp = Blueprint('reservas', __name__, url_prefix='/api/reservas')


@reservas_bp.route('/', methods=['GET'])
def get_reservas():
    """
    Obtener todas las reservas
    Query params:
    - local_id: filtrar por local
    - usuario_id: filtrar por usuario
    - estado: filtrar por estado
    - fecha: filtrar por fecha específica (YYYY-MM-DD)
    - fecha_desde: desde fecha
    - fecha_hasta: hasta fecha
    """
    local_id = request.args.get('local_id', type=int)
    usuario_id = request.args.get('usuario_id', type=int)
    estado = request.args.get('estado')
    fecha_str = request.args.get('fecha')
    fecha_desde = request.args.get('fecha_desde')
    fecha_hasta = request.args.get('fecha_hasta')
    
    query = Reserva.query
    
    if local_id:
        query = query.filter(Reserva.id_local == local_id)
    
    if usuario_id:
        query = query.filter(Reserva.id_usuario == usuario_id)
    
    if estado:
        query = query.filter(Reserva.estado == estado)
    
    if fecha_str:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        query = query.filter(Reserva.fecha_reserva == fecha)
    
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
            'usuario': {
                'id': r.usuario.id,
                'nombre': r.usuario.nombre
            },
            'fecha_reserva': str(r.fecha_reserva) if r.fecha_reserva else None,
            'hora_reserva': str(r.hora_reserva) if r.hora_reserva else None,
            'estado': r.estado,
            'creada_el': r.creada_el.isoformat() if r.creada_el else None
        }
        for r in reservas
    ])


@reservas_bp.route('/<int:reserva_id>', methods=['GET'])
def get_reserva(reserva_id):
    """Obtener detalles de una reserva específica"""
    reserva = Reserva.query.get_or_404(reserva_id)
    
    # Obtener mesas asignadas
    reservas_mesa = ReservaMesa.query.filter_by(id_reserva=reserva_id).all()
    
    return jsonify({
        'id': reserva.id,
        'local': {
            'id': reserva.local.id,
            'nombre': reserva.local.nombre,
            'telefono': reserva.local.telefono,
            'direccion': reserva.local.direccion.comuna.nombre
        },
        'usuario': {
            'id': reserva.usuario.id,
            'nombre': reserva.usuario.nombre,
            'telefono': reserva.usuario.telefono,
            'correo': reserva.usuario.correo
        },
        'fecha_reserva': str(reserva.fecha_reserva) if reserva.fecha_reserva else None,
        'hora_reserva': str(reserva.hora_reserva) if reserva.hora_reserva else None,
        'estado': reserva.estado,
        'mesas': [
            {
                'id': rm.mesa.id,
                'nombre': rm.mesa.nombre,
                'capacidad': rm.mesa.capacidad,
                'prioridad': rm.prioridad
            }
            for rm in reservas_mesa
        ],
        'creada_el': reserva.creada_el.isoformat() if reserva.creada_el else None,
        'expira_el': reserva.expirado_el.isoformat() if reserva.expirado_el else None
    })


@reservas_bp.route('/', methods=['POST'])
def create_reserva():
    """
    Crear una nueva reserva
    Body JSON:
    {
        "id_local": 1,
        "id_usuario": 1,
        "fecha_reserva": "2025-11-20",
        "hora_reserva": "19:30",
        "num_personas": 4,
        "mesas_ids": [1, 2] (opcional)
    }
    """
    data = request.get_json()
    
    # Validar que el local existe
    local = Local.query.get_or_404(data['id_local'])
    usuario = Usuario.query.get_or_404(data['id_usuario'])
    
    # Crear reserva
    reserva = Reserva(
        id_local=data['id_local'],
        id_usuario=data['id_usuario'],
        fecha_reserva=datetime.strptime(data['fecha_reserva'], '%Y-%m-%d').date(),
        hora_reserva=datetime.strptime(data['hora_reserva'], '%H:%M').time(),
        estado=data.get('estado', 'pendiente')
    )
    db.session.add(reserva)
    db.session.flush()
    
    # Asignar mesas si se proporcionaron
    if 'mesas_ids' in data:
        for idx, mesa_id in enumerate(data['mesas_ids']):
            mesa = Mesa.query.get(mesa_id)
            if mesa and mesa.id_local == data['id_local']:
                reserva_mesa = ReservaMesa(
                    id_reserva=reserva.id,
                    id_mesa=mesa_id,
                    prioridad=idx + 1
                )
                db.session.add(reserva_mesa)
    
    db.session.commit()
    
    return jsonify({
        'id': reserva.id,
        'mensaje': 'Reserva creada exitosamente',
        'estado': reserva.estado
    }), 201


@reservas_bp.route('/<int:reserva_id>', methods=['PATCH'])
def update_reserva(reserva_id):
    """
    Actualizar estado de una reserva
    Body JSON: {"estado": "confirmada"}
    Estados posibles: pendiente, confirmada, cancelada, completada
    """
    reserva = Reserva.query.get_or_404(reserva_id)
    data = request.get_json()
    
    if 'estado' in data:
        reserva.estado = data['estado']
    
    db.session.commit()
    
    return jsonify({
        'id': reserva.id,
        'estado': reserva.estado,
        'mensaje': 'Reserva actualizada exitosamente'
    })


@reservas_bp.route('/<int:reserva_id>', methods=['DELETE'])
def delete_reserva(reserva_id):
    """Cancelar/eliminar una reserva"""
    reserva = Reserva.query.get_or_404(reserva_id)
    
    # Opción 1: Cambiar estado a cancelada (soft delete)
    reserva.estado = 'cancelada'
    db.session.commit()
    
    # Opción 2: Eliminar completamente (descomentar si se prefiere)
    # db.session.delete(reserva)
    # db.session.commit()
    
    return jsonify({
        'mensaje': 'Reserva cancelada exitosamente'
    })


@reservas_bp.route('/disponibilidad', methods=['GET'])
def check_disponibilidad():
    """
    Verificar disponibilidad de mesas en un local
    Query params:
    - local_id: ID del local (requerido)
    - fecha: fecha de la reserva (YYYY-MM-DD, requerido)
    - hora: hora de la reserva (HH:MM, requerido)
    - num_personas: número de personas (opcional)
    """
    local_id = request.args.get('local_id', type=int)
    fecha_str = request.args.get('fecha')
    hora_str = request.args.get('hora')
    num_personas = request.args.get('num_personas', type=int)
    
    if not local_id or not fecha_str or not hora_str:
        return jsonify({'error': 'Faltan parámetros requeridos'}), 400
    
    fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    hora = datetime.strptime(hora_str, '%H:%M').time()
    
    # Obtener todas las mesas del local
    mesas = Mesa.query.filter_by(id_local=local_id).all()
    
    # Obtener reservas existentes para esa fecha y hora
    reservas_existentes = Reserva.query.filter(
        Reserva.id_local == local_id,
        Reserva.fecha_reserva == fecha,
        Reserva.estado.in_(['pendiente', 'confirmada'])
    ).all()
    
    # Obtener IDs de mesas reservadas
    mesas_reservadas_ids = set()
    for reserva in reservas_existentes:
        reservas_mesa = ReservaMesa.query.filter_by(id_reserva=reserva.id).all()
        mesas_reservadas_ids.update([rm.id_mesa for rm in reservas_mesa])
    
    # Filtrar mesas disponibles
    mesas_disponibles = [
        {
            'id': m.id,
            'nombre': m.nombre,
            'capacidad': m.capacidad,
            'estado': m.estado
        }
        for m in mesas
        if m.id not in mesas_reservadas_ids and m.estado == 'disponible'
    ]
    
    # Si se especifica número de personas, filtrar por capacidad
    if num_personas:
        mesas_disponibles = [
            m for m in mesas_disponibles 
            if m['capacidad'] >= num_personas
        ]
    
    return jsonify({
        'local_id': local_id,
        'fecha': fecha_str,
        'hora': hora_str,
        'mesas_disponibles': mesas_disponibles,
        'total_disponibles': len(mesas_disponibles)
    })
