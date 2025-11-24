"""
Inicialización de blueprints de rutas
Importa y exporta todos los blueprints de la aplicación
"""

from app.routes.locales import locales_bp
from app.routes.usuarios import usuarios_bp
from app.routes.reservas import reservas_bp
from app.routes.search import search_bp

# Exportar todos los blueprints para fácil importación
__all__ = ['locales_bp', 'usuarios_bp', 'reservas_bp', 'search_bp']
