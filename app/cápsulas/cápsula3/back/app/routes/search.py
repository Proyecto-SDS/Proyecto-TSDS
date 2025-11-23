"""
Rutas para búsquedas y filtros generales
Endpoints auxiliares para comunas, categorías, etc.
"""

from flask import Blueprint, jsonify, request
from app import db
from app.models import Comuna, Categoria, Rol, TipoFoto, Local, Direccion
from sqlalchemy.orm import joinedload
from math import radians, cos, sin, asin, sqrt

search_bp = Blueprint('search', __name__, url_prefix='/api')


# ==================== BÚSQUEDA DE LOCALES ====================

@search_bp.route('/search', methods=['GET'])
def search_locales():
    """
    Búsqueda general de locales por nombre, tipo o ubicación
    Query params:
    - q: término de búsqueda (busca en nombre del local)
    - tipo: filtrar por tipo de local (Restaurante, Cafetería, Restobar)
    - lat, lng: coordenadas para calcular distancia
    """
    q = request.args.get('q', '').strip()
    tipo = request.args.get('tipo')
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    
    # Query base con eager loading optimizado
    query = db.session.query(Local).options(
        joinedload(Local.direccion).joinedload(Direccion.comuna)
    ).join(Direccion).join(Comuna)
    
    # Filtrar por término de búsqueda
    if q:
        query = query.filter(Local.nombre.ilike(f'%{q}%'))
    
    # Filtrar por tipo
    if tipo:
        query = query.filter(Local.tipo == tipo)
    
    # Ejecutar query
    locales = query.distinct().all()
    
    # Función auxiliar para calcular distancia
    def calcular_distancia(lat1, lon1, lat2, lon2):
        """Calcula distancia en km usando fórmula Haversine"""
        if not all([lat1, lon1, lat2, lon2]):
            return None
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return round(km, 2)
    
    # Formatear respuesta
    resultado = []
    for local in locales:
        distancia = None
        if lat and lng and local.direccion:
            distancia = calcular_distancia(
                lat, lng,
                float(local.direccion.latitud) if local.direccion.latitud else None,
                float(local.direccion.longitud) if local.direccion.longitud else None
            )
        
        resultado.append({
            'id': local.id,
            'nombre': local.nombre,
            'tipo': local.tipo,
            'telefono': local.telefono,
            'correo': local.correo,
            'comuna': local.direccion.comuna.nombre if local.direccion and local.direccion.comuna else None,
            'lat': float(local.direccion.latitud) if local.direccion and local.direccion.latitud else None,
            'lng': float(local.direccion.longitud) if local.direccion and local.direccion.longitud else None,
            'distancia_km': distancia,
            'direccion': {
                'id': local.direccion.id,
                'comuna': local.direccion.comuna.nombre if local.direccion.comuna else None,
                'numero': local.direccion.numero,
                'latitud': float(local.direccion.latitud) if local.direccion.latitud else None,
                'longitud': float(local.direccion.longitud) if local.direccion.longitud else None
            } if local.direccion else None
        })
    
    # Ordenar por distancia si hay coordenadas
    if lat and lng:
        resultado.sort(key=lambda x: x['distancia_km'] if x['distancia_km'] is not None else float('inf'))
    
    return jsonify(resultado)


# ==================== COMUNAS ====================

@search_bp.route('/comunas', methods=['GET'])
def get_comunas():
    """Obtener todas las comunas"""
    comunas = Comuna.query.all()
    return jsonify([
        {'id': c.id, 'nombre': c.nombre} 
        for c in comunas
    ])


@search_bp.route('/comunas', methods=['POST'])
def create_comuna():
    """Crear una nueva comuna"""
    data = request.get_json()
    
    # Validar que no exista
    if Comuna.query.filter_by(nombre=data['nombre']).first():
        return jsonify({'error': 'La comuna ya existe'}), 400
    
    nueva_comuna = Comuna(nombre=data['nombre'])
    db.session.add(nueva_comuna)
    db.session.commit()
    
    return jsonify({'id': nueva_comuna.id, 'nombre': nueva_comuna.nombre}), 201


# ==================== CATEGORÍAS ====================

@search_bp.route('/categorias', methods=['GET'])
def get_categorias():
    """
    Obtener todas las categorías de productos
    Query params:
    - con_productos: si es true, solo devuelve categorías que tienen productos
    """
    con_productos = request.args.get('con_productos', type=lambda v: v.lower() == 'true')
    
    if con_productos:
        # Solo categorías con productos
        categorias = db.session.query(Categoria).join(
            Categoria.productos
        ).distinct().all()
    else:
        categorias = Categoria.query.all()
    
    return jsonify([
        {'id': c.id, 'nombre': c.nombre}
        for c in categorias
    ])


@search_bp.route('/categorias', methods=['POST'])
def create_categoria():
    """Crear una nueva categoría"""
    data = request.get_json()
    
    if Categoria.query.filter_by(nombre=data['nombre']).first():
        return jsonify({'error': 'La categoría ya existe'}), 400
    
    nueva_categoria = Categoria(nombre=data['nombre'])
    db.session.add(nueva_categoria)
    db.session.commit()
    
    return jsonify({'id': nueva_categoria.id, 'nombre': nueva_categoria.nombre}), 201


# ==================== ROLES ====================

@search_bp.route('/roles', methods=['GET'])
def get_roles():
    """Obtener todos los roles de usuario"""
    roles = Rol.query.all()
    return jsonify([
        {'id': r.id, 'nombre': r.nombre}
        for r in roles
    ])


# ==================== ENDPOINT DE PRUEBA ====================

@search_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Endpoint de prueba para verificar que la API funciona"""
    return jsonify({
        'mensaje': 'API funcionando correctamente',
        'version': '1.0.0',
        'endpoints_disponibles': {
            'locales': [
                'GET /api/locales - Listar locales con filtros',
                'GET /api/locales/<id> - Detalle de un local',
                'GET /api/locales/buscar - Búsqueda avanzada',
                'POST /api/locales - Crear local',
                'GET /api/locales/<id>/mesas - Mesas de un local',
                'GET /api/locales/<id>/productos - Productos de un local'
            ],
            'usuarios': [
                'GET /api/usuarios - Listar usuarios',
                'GET /api/usuarios/<id> - Detalle de usuario',
                'POST /api/usuarios - Crear usuario',
                'GET /api/usuarios/<id>/favoritos - Favoritos del usuario',
                'GET /api/usuarios/<id>/reservas - Reservas del usuario',
                'GET /api/usuarios/<id>/opiniones - Opiniones del usuario'
            ],
            'reservas': [
                'GET /api/reservas - Listar reservas con filtros',
                'GET /api/reservas/<id> - Detalle de una reserva',
                'POST /api/reservas - Crear reserva',
                'PATCH /api/reservas/<id> - Actualizar reserva',
                'DELETE /api/reservas/<id> - Cancelar reserva',
                'GET /api/reservas/disponibilidad - Verificar disponibilidad'
            ],
            'auxiliares': [
                'GET /api/comunas - Listar comunas',
                'POST /api/comunas - Crear comuna',
                'GET /api/categorias - Listar categorías',
                'POST /api/categorias - Crear categoría',
                'GET /api/roles - Listar roles',
                'GET /api/test - Este endpoint'
            ]
        }
    })


@search_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'API ReservaYa funcionando correctamente'
    }), 200
