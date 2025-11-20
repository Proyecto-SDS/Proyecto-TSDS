"""
Rutas para gestión de locales/restaurantes
Endpoints para búsqueda, filtrado y detalles de restaurantes
"""

from flask import Blueprint, jsonify, request
from app import db
from app.models import Local, Direccion, Comuna, Horario, Mesa, Producto, Categoria
from sqlalchemy import or_, and_

locales_bp = Blueprint('locales', __name__, url_prefix='/api/locales')


@locales_bp.route('/', methods=['GET'])
def get_locales():
    """
    Obtener todos los locales con filtros opcionales
    Query params:
    - tipo: filtrar por tipo de local (Restaurante, Cafetería, Restobar)
    - comuna: filtrar por nombre de comuna
    - nombre: buscar por nombre (búsqueda parcial)
    - capacidad_min: mesas con capacidad mínima
    """
    # Obtener parámetros de búsqueda
    tipo = request.args.get('tipo')
    comuna = request.args.get('comuna')
    nombre = request.args.get('nombre')
    capacidad_min = request.args.get('capacidad_min', type=int)
    
    # Query base
    query = Local.query.join(Direccion).join(Comuna)
    
    # Aplicar filtros
    if tipo:
        # Aquí necesitarías agregar el campo 'tipo' en el modelo Local
        # o buscarlo en la tabla tipo_local
        pass
    
    if comuna:
        query = query.filter(Comuna.nombre.ilike(f'%{comuna}%'))
    
    if nombre:
        query = query.filter(Local.nombre.ilike(f'%{nombre}%'))
    
    if capacidad_min:
        query = query.join(Mesa).filter(Mesa.capacidad >= capacidad_min)
    
    locales = query.distinct().all()
    
    return jsonify([
        {
            'id': local.id,
            'nombre': local.nombre,
            'telefono': local.telefono,
            'correo': local.correo,
            'direccion': {
                'id': local.direccion.id,
                'numero': local.direccion.numero,
                'latitud': float(local.direccion.latitud) if local.direccion.latitud else None,
                'longitud': float(local.direccion.longitud) if local.direccion.longitud else None,
                'comuna': local.direccion.comuna.nombre
            }
        }
        for local in locales
    ])


@locales_bp.route('/<int:local_id>', methods=['GET'])
def get_local_detalle(local_id):
    """Obtener información completa de un local específico"""
    local = Local.query.get_or_404(local_id)
    
    return jsonify({
        'id': local.id,
        'nombre': local.nombre,
        'telefono': local.telefono,
        'correo': local.correo,
        'direccion': {
            'numero': local.direccion.numero,
            'latitud': float(local.direccion.latitud) if local.direccion.latitud else None,
            'longitud': float(local.direccion.longitud) if local.direccion.longitud else None,
            'comuna': local.direccion.comuna.nombre
        },
        'horarios': [
            {
                'dia_semana': h.dia_semana,
                'hora_apertura': str(h.hora_apertura) if h.hora_apertura else None,
                'hora_cierre': str(h.hora_cierre) if h.hora_cierre else None,
                'abierto': h.abierto
            }
            for h in local.horarios
        ],
        'mesas': [
            {
                'id': m.id,
                'nombre': m.nombre,
                'capacidad': m.capacidad,
                'estado': m.estado
            }
            for m in local.mesas
        ],
        'productos': [
            {
                'id': p.id,
                'nombre': p.nombre,
                'descripcion': p.descripcion,
                'precio': p.precio,
                'categoria': p.categoria.nombre,
                'disponible': p.disponible
            }
            for p in local.productos
        ]
    })


@locales_bp.route('/buscar', methods=['GET'])
def buscar_locales():
    """
    Búsqueda avanzada de locales
    Query params:
    - q: término de búsqueda general (nombre o comuna)
    - categoria: filtrar por categoría de productos
    - precio_max: precio máximo de productos
    - precio_min: precio mínimo de productos
    - lat: latitud para búsqueda por proximidad
    - lng: longitud para búsqueda por proximidad
    - radio: radio en km (requiere lat y lng)
    """
    q = request.args.get('q', '')
    categoria = request.args.get('categoria')
    precio_max = request.args.get('precio_max', type=int)
    precio_min = request.args.get('precio_min', type=int)
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radio = request.args.get('radio', type=float, default=5.0)
    
    query = Local.query.join(Direccion).join(Comuna)
    
    # Búsqueda general
    if q:
        query = query.filter(
            or_(
                Local.nombre.ilike(f'%{q}%'),
                Comuna.nombre.ilike(f'%{q}%')
            )
        )
    
    # Filtro por categoría de productos
    if categoria:
        query = query.join(Producto).join(Categoria).filter(
            Categoria.nombre.ilike(f'%{categoria}%')
        )
    
    # Filtro por rango de precios
    if precio_min is not None or precio_max is not None:
        query = query.join(Producto)
        if precio_min is not None:
            query = query.filter(Producto.precio >= precio_min)
        if precio_max is not None:
            query = query.filter(Producto.precio <= precio_max)
    
    # TODO: Implementar búsqueda por proximidad con lat/lng/radio
    # Requiere funciones de distancia geográfica (Haversine o PostGIS)
    
    locales = query.distinct().all()
    
    return jsonify([
        {
            'id': local.id,
            'nombre': local.nombre,
            'telefono': local.telefono,
            'correo': local.correo,
            'comuna': local.direccion.comuna.nombre,
            'coordenadas': {
                'lat': float(local.direccion.latitud) if local.direccion.latitud else None,
                'lng': float(local.direccion.longitud) if local.direccion.longitud else None
            }
        }
        for local in locales
    ])


@locales_bp.route('/', methods=['POST'])
def create_local():
    """Crear un nuevo local"""
    data = request.get_json()
    
    # Crear o buscar comuna
    comuna_nombre = data.get('comuna')
    comuna = Comuna.query.filter_by(nombre=comuna_nombre).first()
    if not comuna:
        comuna = Comuna(nombre=comuna_nombre)
        db.session.add(comuna)
        db.session.flush()
    
    # Crear dirección
    direccion = Direccion(
        id_comuna=comuna.id,
        numero=data.get('numero'),
        latitud=data.get('latitud'),
        longitud=data.get('longitud')
    )
    db.session.add(direccion)
    db.session.flush()
    
    # Crear local
    local = Local(
        id_direccion=direccion.id,
        nombre=data['nombre'],
        telefono=data.get('telefono'),
        correo=data.get('correo')
    )
    db.session.add(local)
    db.session.commit()
    
    return jsonify({
        'id': local.id,
        'nombre': local.nombre,
        'mensaje': 'Local creado exitosamente'
    }), 201


@locales_bp.route('/<int:local_id>/mesas', methods=['GET'])
def get_mesas_local(local_id):
    """
    Obtener todas las mesas de un local
    Query params:
    - capacidad: filtrar por capacidad específica
    - capacidad_min: capacidad mínima
    - estado: filtrar por estado (disponible, ocupada, reservada)
    """
    local = Local.query.get_or_404(local_id)
    
    capacidad = request.args.get('capacidad', type=int)
    capacidad_min = request.args.get('capacidad_min', type=int)
    estado = request.args.get('estado')
    
    query = Mesa.query.filter_by(id_local=local_id)
    
    if capacidad:
        query = query.filter(Mesa.capacidad == capacidad)
    elif capacidad_min:
        query = query.filter(Mesa.capacidad >= capacidad_min)
    
    if estado:
        query = query.filter(Mesa.estado == estado)
    
    mesas = query.all()
    
    return jsonify([
        {
            'id': m.id,
            'nombre': m.nombre,
            'capacidad': m.capacidad,
            'estado': m.estado
        }
        for m in mesas
    ])


@locales_bp.route('/<int:local_id>/productos', methods=['GET'])
def get_productos_local(local_id):
    """
    Obtener productos/menú de un local
    Query params:
    - categoria: filtrar por categoría
    - disponible: filtrar por disponibilidad (true/false)
    - precio_max: precio máximo
    - precio_min: precio mínimo
    """
    local = Local.query.get_or_404(local_id)
    
    categoria = request.args.get('categoria')
    disponible = request.args.get('disponible', type=lambda v: v.lower() == 'true')
    precio_max = request.args.get('precio_max', type=int)
    precio_min = request.args.get('precio_min', type=int)
    
    query = Producto.query.filter_by(id_local=local_id)
    
    if categoria:
        query = query.join(Categoria).filter(Categoria.nombre.ilike(f'%{categoria}%'))
    
    if disponible is not None:
        query = query.filter(Producto.disponible == disponible)
    
    if precio_min is not None:
        query = query.filter(Producto.precio >= precio_min)
    
    if precio_max is not None:
        query = query.filter(Producto.precio <= precio_max)
    
    productos = query.all()
    
    return jsonify([
        {
            'id': p.id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'precio': p.precio,
            'categoria': p.categoria.nombre,
            'disponible': p.disponible,
            'estado': p.estado
        }
        for p in productos
    ])
