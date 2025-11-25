from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from database import db_session
from models import Local, Direccion, Comuna, TipoLocal, Horario, Foto, Opinion, TipoFoto, Redes, TipoRed
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
                joinedload(Local.fotos).joinedload(Foto.tipo_foto),
                joinedload(Local.opiniones)
            ).all()
        
        resultado = []
        for local in locales:
            # Calcular promedio de puntuaciones
            rating = None
            review_count = 0
            if local.opiniones:
                # Filtrar opiniones no eliminadas
                opiniones_activas = [op for op in local.opiniones if op.eliminado_el is None]
                puntuaciones = [float(op.puntuacion) for op in opiniones_activas if op.puntuacion is not None]
                if puntuaciones:
                    rating = round(sum(puntuaciones) / len(puntuaciones), 1)
                    review_count = len(puntuaciones)
            
            # Determinar estado (abierto/cerrado) basado en horarios
            status = 'closed'
            closing_time = None
            now = datetime.now()
            current_time = now.time()
            current_day = now.weekday() + 1  # 1 = Lunes, 7 = Domingo
            
            for horario in local.horarios:
                if horario.dia_semana == current_day and horario.abierto:
                    # Manejar horarios que cruzan medianoche (ej: 18:00 - 02:00)
                    if horario.hora_apertura <= horario.hora_cierre:
                        # Horario normal (no cruza medianoche)
                        if horario.hora_apertura <= current_time <= horario.hora_cierre:
                            status = 'open'
                            closing_time = horario.hora_cierre.strftime('%H:%M')
                            break
                    else:
                        # Horario que cruza medianoche
                        if current_time >= horario.hora_apertura or current_time <= horario.hora_cierre:
                            status = 'open'
                            closing_time = horario.hora_cierre.strftime('%H:%M')
                            break
            
            # Obtener imagen principal
            image = None
            if local.fotos:
                # Buscar foto de tipo "banner" o "hero" o tomar la primera
                foto_principal = next(
                    (f for f in local.fotos 
                     if f.tipo_foto and f.tipo_foto.nombre in ['banner', 'hero', 'logo']), 
                    None
                )
                if foto_principal:
                    image = foto_principal.ruta
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
    """Obtiene un local específico por ID con información detallada."""
    try:
        local = db_session.query(Local)\
            .options(
                joinedload(Local.direccion).joinedload(Direccion.comuna),
                joinedload(Local.tipo_local),
                joinedload(Local.horarios),
                joinedload(Local.fotos).joinedload(Foto.tipo_foto),
                joinedload(Local.opiniones),
                joinedload(Local.redes).joinedload(Redes.tipo_red)
            )\
            .filter(Local.id == id)\
            .first()
        
        if not local:
            return jsonify({"error": "Local no encontrado"}), 404
        
        # Calcular promedio de puntuaciones
        rating = None
        review_count = 0
        opiniones_lista = []
        if local.opiniones:
            # Filtrar opiniones no eliminadas
            opiniones_activas = [op for op in local.opiniones if op.eliminado_el is None]
            puntuaciones = [float(op.puntuacion) for op in opiniones_activas if op.puntuacion is not None]
            if puntuaciones:
                rating = round(sum(puntuaciones) / len(puntuaciones), 1)
                review_count = len(puntuaciones)
            
            # Formatear opiniones para respuesta
            for opinion in opiniones_activas:
                opiniones_lista.append({
                    'id': opinion.id,
                    'usuario': opinion.usuario.nombre if opinion.usuario else 'Anónimo',
                    'puntuacion': float(opinion.puntuacion) if opinion.puntuacion else None,
                    'comentario': opinion.comentario,
                    'fecha': opinion.creado_el.isoformat() if opinion.creado_el else None
                })
        
        # Determinar estado (abierto/cerrado)
        status = 'closed'
        closing_time = None
        now = datetime.now()
        current_time = now.time()
        current_day = now.weekday() + 1  # 1 = Lunes, 7 = Domingo
        
        dias_semana = {
            1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 
            4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
        }
        
        horarios_formateados = []
        for horario in local.horarios:
            if horario.dia_semana == current_day and horario.abierto:
                # Manejar horarios que cruzan medianoche (ej: 18:00 - 02:00)
                if horario.hora_apertura <= horario.hora_cierre:
                    # Horario normal (no cruza medianoche)
                    if horario.hora_apertura <= current_time <= horario.hora_cierre:
                        status = 'open'
                        closing_time = horario.hora_cierre.strftime('%H:%M')
                else:
                    # Horario que cruza medianoche
                    if current_time >= horario.hora_apertura or current_time <= horario.hora_cierre:
                        status = 'open'
                        closing_time = horario.hora_cierre.strftime('%H:%M')
            
            horarios_formateados.append({
                'dia': dias_semana.get(horario.dia_semana, f'Día {horario.dia_semana}'),
                'diaNumero': horario.dia_semana,
                'apertura': horario.hora_apertura.strftime('%H:%M'),
                'cierre': horario.hora_cierre.strftime('%H:%M'),
                'abierto': horario.abierto,
                'tipo': horario.tipo.value if horario.tipo else 'normal'
            })
        
        # Ordenar horarios por día
        horarios_formateados.sort(key=lambda x: x['diaNumero'])
        
        # Obtener todas las fotos organizadas por tipo
        fotos_dict = {
            'banner': [],
            'hero': [],
            'logo': None,
            'galeria': [],
            'todas': []
        }
        
        if local.fotos:
            for foto in local.fotos:
                fotos_dict['todas'].append(foto.ruta)
                if foto.tipo_foto:
                    tipo_nombre = foto.tipo_foto.nombre.lower()
                    if tipo_nombre in ['banner', 'hero']:
                        fotos_dict[tipo_nombre].append(foto.ruta)
                    elif tipo_nombre == 'logo':
                        fotos_dict['logo'] = foto.ruta
                    else:
                        fotos_dict['galeria'].append(foto.ruta)
        
        # Obtener redes sociales
        redes_sociales = []
        if local.redes:
            for red in local.redes:
                redes_sociales.append({
                    'tipo': red.tipo_red.nombre if red.tipo_red else 'Red Social',
                    'usuario': red.nombre_usuario,
                    'url': red.url
                })
        
        # Construir respuesta detallada
        local_data = {
            'id': str(local.id),
            'name': local.nombre,
            'type': local.tipo_local.nombre if local.tipo_local else 'Restaurante',
            'address': f"{local.direccion.numero}" if local.direccion else '',
            'commune': local.direccion.comuna.nombre if local.direccion and local.direccion.comuna else '',
            'phone': f"+56{local.telefono}",
            'email': local.correo,
            'images': fotos_dict,
            'rating': rating,
            'reviewCount': review_count,
            'reviews': opiniones_lista,
            'status': status,
            'closingTime': closing_time,
            'coordinates': [
                float(local.direccion.longitud) if local.direccion else -70.6693,
                float(local.direccion.latitud) if local.direccion else -33.4489
            ],
            'horarios': horarios_formateados,
            'redesSociales': redes_sociales
        }
        
        return jsonify(local_data), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
