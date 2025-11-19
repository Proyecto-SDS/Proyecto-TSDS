"""
Rutas para búsquedas y filtros generales
Endpoints auxiliares para comunas, categorías, etc.
"""

from flask import Blueprint, jsonify, request
from app import db
from app.models import Comuna, Categoria, Rol, TipoFoto

search_bp = Blueprint('search', __name__, url_prefix='/api')


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
