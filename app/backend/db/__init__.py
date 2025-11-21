from .base import Base, engine
from .sesion import get_db
import modelos

Base.metadata.create_all(bind=engine)