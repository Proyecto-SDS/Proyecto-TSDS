from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from database import db_session
from models import Local, Direccion, Comuna, TipoLocal, Horario, Foto, Opinion
from datetime import datetime, time

# Crear el Blueprint
locales_bp = Blueprint('locales', __name__, url_prefix='/api/locales')

@locales_bp.route('/', methods=['GET'])
def obtener_locales():
    """Obtiene todos los locales de la base de datos con información completa."""
    try:
        # Consultar locales con relaciones pre-cargadas para optimizar
        locales = db_session.query(Local)\
            .options(
                joinedload(Local.direccion).joinedload(Direccion.comuna),
                joinedload(Local.tipo_local),
                joinedload(Local.horarios),
                joinedload(Local.fotos),
                joinedload(Local.opiniones)
            ).all()
        
        resultado = []
        for local in locales:
            # Calcular promedio de calificaciones
            rating = None
            review_count = 0
            if local.opiniones:
                calificaciones = [op.calificacion for op in local.opiniones if op.calificacion]
                if calificaciones:
                    rating = round(sum(calificaciones) / len(calificaciones), 1)
                    review_count = len(calificaciones)
            
            # Determinar estado (abierto/cerrado) basado en horarios
            status = 'closed'
            closing_time = None
            now = datetime.now()
            current_time = now.time()
            current_day = now.weekday() + 1  # 1 = Lunes, 7 = Domingo
            
            for horario in local.horarios:
                if horario.dia_semana == current_day and horario.abierto:
                    if horario.hora_apertura <= current_time <= horario.hora_cierre:
                        status = 'open'
                        closing_time = horario.hora_cierre.strftime('%H:%M')
                        break
            
            # Obtener imagen principal
            image = None
            if local.fotos:
                # Buscar foto de tipo "portada" o tomar la primera
                foto_portada = next((f for f in local.fotos if f.tipo_foto and f.tipo_foto.nombre == 'portada'), None)
                if foto_portada:
                    image = foto_portada.ruta
                elif local.fotos:
                    image = local.fotos[0].ruta
            
            # Construir objeto de respuesta
            local_data = {
                'id': str(local.id),
                'name': local.nombre,
                'type': local.tipo_local.nombre if local.tipo_local else 'Restaurante',
                'address': f"{local.direccion.numero}" if local.direccion else '',
                'commune': local.direccion.comuna.nombre if local.direccion and local.direccion.comuna else '',
                'phone': f"+56{local.telefono}",
                'email': local.correo,
                'image': image,
                'rating': rating,
                'reviewCount': review_count,
                'status': status,
                'closingTime': closing_time,
                'coordinates': [
                    float(local.direccion.longitud) if local.direccion else -70.6693,
                    float(local.direccion.latitud) if local.direccion else -33.4489
                ]
            }
            
            resultado.append(local_data)
            
        return jsonify(resultado), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@locales_bp.route('/<int:id>', methods=['GET'])
def obtener_local(id):
    """Obtiene un local específico por ID."""
    try:
        local = db_session.query(Local)\
            .options(
                joinedload(Local.direccion).joinedload(Direccion.comuna),
                joinedload(Local.tipo_local),
                joinedload(Local.horarios),
                joinedload(Local.fotos),
                joinedload(Local.opiniones),
                joinedload(Local.redes)
            )\
            .filter(Local.id == id)\
            .first()
        
        if not local:
            return jsonify({"error": "Local no encontrado"}), 404
        
        # Calcular promedio de calificaciones
        rating = None
        review_count = 0
        if local.opiniones:
            calificaciones = [op.calificacion for op in local.opiniones if op.calificacion]
            if calificaciones:
                rating = round(sum(calificaciones) / len(calificaciones), 1)
                review_count = len(calificaciones)
        
        # Determinar estado (abierto/cerrado)
        status = 'closed'
        closing_time = None
        now = datetime.now()
        current_time = now.time()
        current_day = now.weekday() + 1
        
        horarios_formateados = []
        for horario in local.horarios:
            if horario.dia_semana == current_day and horario.abierto:
                if horario.hora_apertura <= current_time <= horario.hora_cierre:
                    status = 'open'
                    closing_time = horario.hora_cierre.strftime('%H:%M')
            
            horarios_formateados.append({
                'dia': horario.dia_semana,
                'apertura': horario.hora_apertura.strftime('%H:%M'),
                'cierre': horario.hora_cierre.strftime('%H:%M'),
                'abierto': horario.abierto
            })
        
        # Obtener todas las fotos
        fotos = [foto.ruta for foto in local.fotos] if local.fotos else []
        
        # Construir respuesta detallada
        local_data = {
            'id': str(local.id),
            'name': local.nombre,
            'type': local.tipo_local.nombre if local.tipo_local else 'Restaurante',
            'address': f"{local.direccion.numero}" if local.direccion else '',
            'commune': local.direccion.comuna.nombre if local.direccion and local.direccion.comuna else '',
            'phone': f"+56{local.telefono}",
            'email': local.correo,
            'images': fotos,
            'rating': rating,
            'reviewCount': review_count,
            'status': status,
            'closingTime': closing_time,
            'coordinates': [
                float(local.direccion.longitud) if local.direccion else -70.6693,
                float(local.direccion.latitud) if local.direccion else -33.4489
            ],
            'horarios': horarios_formateados
        }
        
        return jsonify(local_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
