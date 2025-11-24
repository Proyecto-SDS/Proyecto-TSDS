from flask import Blueprint, jsonify
from database import db_session
from models import Local, LocalSchema

# Crear el Blueprint
locales_bp = Blueprint('locales', __name__, url_prefix='/locales')

@locales_bp.route('/', methods=['GET'])
def obtener_locales():
    """Obtiene todos los locales de la base de datos."""
    try:
        # Consultar todos los locales usando la clase Local
        locales = db_session.query(Local).all()
        
        # Serializar usando el esquema Pydantic v2
        resultado = [LocalSchema.model_validate(local).model_dump() for local in locales]
            
        return jsonify(resultado), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
