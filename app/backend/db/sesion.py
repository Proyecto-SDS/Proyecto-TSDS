from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.config import Configuracion

config = Configuracion()

engine = create_engine(config.DATABASE_URL, future=True)

SesionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

def get_db():
    db = SesionLocal()
    try:
        yield db
    finally:
        db.close()