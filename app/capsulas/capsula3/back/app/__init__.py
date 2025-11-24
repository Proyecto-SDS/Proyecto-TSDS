from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import config

# Inicializar extensiones
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name='default'):
    """Factory para crear la aplicación Flask"""
    
    app = Flask(__name__)
    
    # Cargar configuración
    app.config.from_object(config[config_name])
    
    # Deshabilitar strict_slashes para permitir URLs con y sin barra final
    app.url_map.strict_slashes = False
    
    # Inicializar extensiones con la app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Registrar blueprints (rutas)
    from app.routes import locales_bp, usuarios_bp, reservas_bp, search_bp
    app.register_blueprint(locales_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(reservas_bp)
    app.register_blueprint(search_bp)
    
    # Importar modelos para que Flask-Migrate los reconozca
    with app.app_context():
        from app import models
    
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'message': 'API funcionando correctamente'}, 200
    
    return app
