"""
Script de Seed (Datos Iniciales)
Puebla la base de datos con datos de referencia y ejemplos de testing
"""
import os
import sys
from dotenv import load_dotenv

# Añadir src al path para imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database import db_session
from models import Rol, TipoLocal, Comuna, TipoRed, TipoFoto, Direccion, Local, Categoria

def seed_database():
    """Pobla la base de datos con datos iniciales"""
    db = db_session()
    print("Poblando base de datos con datos iniciales...")
    
    try:
        # ============ Roles ============
        if db.query(Rol).count() == 0:
            print("  → Insertando Roles...")
            db.add_all([
                Rol(nombre="admin"),
                Rol(nombre="gerente"),
                Rol(nombre="chef"),
                Rol(nombre="mesero"),
                Rol(nombre="cliente"),
            ])
            db.commit()
            print("    ✓ Roles insertados")
        else:
            print("  ⊘ Roles ya existen, saltando...")

        # ============ Tipos de Local ============
        if db.query(TipoLocal).count() == 0:
            print("  → Insertando Tipos de Local...")
            db.add_all([
                TipoLocal(nombre="Restaurante"),
                TipoLocal(nombre="Bar"),
                TipoLocal(nombre="Cafetería"),
                TipoLocal(nombre="Pub"),
                TipoLocal(nombre="Pastelería"),
            ])
            db.commit()
            print("    ✓ Tipos de Local insertados")
        else:
            print("  ⊘ Tipos de Local ya existen, saltando...")

        # ============ Comunas ============
        if db.query(Comuna).count() == 0:
            print("  → Insertando Comunas de Santiago...")
            db.add_all([
                Comuna(nombre="Santiago"),
                Comuna(nombre="Cerrillos"),
                Comuna(nombre="Cerro Navia"),
                Comuna(nombre="Conchalí"),
                Comuna(nombre="El Bosque"),
                Comuna(nombre="Estación Central"),
                Comuna(nombre="Huechuraba"),
                Comuna(nombre="Independencia"),
                Comuna(nombre="La Cisterna"),
                Comuna(nombre="La Florida"),
                Comuna(nombre="La Granja"),
                Comuna(nombre="La Pintana"),
                Comuna(nombre="La Reina"),
                Comuna(nombre="Las Condes"),
                Comuna(nombre="Lo Barnechea"),
                Comuna(nombre="Lo Espejo"),
                Comuna(nombre="Lo Prado"),
                Comuna(nombre="Macul"),
                Comuna(nombre="Maipú"),
                Comuna(nombre="Ñuñoa"),
                Comuna(nombre="Pedro Aguirre Cerda"),
                Comuna(nombre="Peñalolén"),
                Comuna(nombre="Providencia"),
                Comuna(nombre="Pudahuel"),
                Comuna(nombre="Quilicura"),
                Comuna(nombre="Quinta Normal"),
                Comuna(nombre="Recoleta"),
                Comuna(nombre="Renca"),
                Comuna(nombre="San Joaquín"),
                Comuna(nombre="San Miguel"),
                Comuna(nombre="San Ramón"),
                Comuna(nombre="Vitacura"),
            ])
            db.commit()
            print("    ✓ Comunas insertadas")
        else:
            print("  ⊘ Comunas ya existen, saltando...")

        # ============ Tipos de Redes Sociales ============
        if db.query(TipoRed).count() == 0:
            print("  → Insertando Tipos de Redes Sociales...")
            db.add_all([
                TipoRed(nombre="Sitio Web"),
                TipoRed(nombre="Instagram"),
                TipoRed(nombre="Facebook"),
                TipoRed(nombre="TikTok"),
                TipoRed(nombre="YouTube"),
                TipoRed(nombre="X/Twitter"),
                TipoRed(nombre="WhatsApp"),
                TipoRed(nombre="LinkedIn"),
            ])
            db.commit()
            print("    ✓ Tipos de Redes Sociales insertados")
        else:
            print("  ⊘ Tipos de Redes Sociales ya existen, saltando...")

        # ============ Tipos de Fotos ============
        if db.query(TipoFoto).count() == 0:
            print("  → Insertando Tipos de Fotos...")
            db.add_all([
                TipoFoto(nombre="banner"),
                TipoFoto(nombre="hero"),
                TipoFoto(nombre="icono"),
                TipoFoto(nombre="logo"),
                TipoFoto(nombre="promocion"),
                TipoFoto(nombre="producto"),
                TipoFoto(nombre="ingredientes"),
                TipoFoto(nombre="menu"),
                TipoFoto(nombre="interior"),
                TipoFoto(nombre="exterior"),
                TipoFoto(nombre="fachada"),
                TipoFoto(nombre="mesa"),
                TipoFoto(nombre="staff"),
                TipoFoto(nombre="galeria"),
            ])
            db.commit()
            print("    ✓ Tipos de Fotos insertados")
        else:
            print("  ⊘ Tipos de Fotos ya existen, saltando...")

        # ============ Categorías de Productos ============
        if db.query(Categoria).count() == 0:
            print("  → Insertando Categorías de Productos...")
            db.add_all([
                Categoria(nombre="Entradas"),
                Categoria(nombre="Platos Principales"),
                Categoria(nombre="Postres"),
                Categoria(nombre="Bebidas"),
                Categoria(nombre="Cervezas"),
                Categoria(nombre="Vinos"),
                Categoria(nombre="Cócteles"),
                Categoria(nombre="Cafés"),
            ])
            db.commit()
            print("    ✓ Categorías insertadas")
        else:
            print("  ⊘ Categorías ya existen, saltando...")

        # ============ DATOS DE EJEMPLO (Para testing) ============
        
        # Direcciones de ejemplo
        if db.query(Direccion).count() == 0:
            print("  → Insertando Direcciones de ejemplo...")
            dir1 = Direccion(id_comuna=1, numero=123, longitud=-70.64827, latitud=-33.45694)
            dir2 = Direccion(id_comuna=23, numero=456, longitud=-70.61203, latitud=-33.4314)
            dir3 = Direccion(id_comuna=14, numero=789, longitud=-70.5679, latitud=-33.4132)
            dir4 = Direccion(id_comuna=1, numero=101, longitud=-70.6506, latitud=-33.4378)
            dir5 = Direccion(id_comuna=23, numero=202, longitud=-70.605, latitud=-33.426)
            db.add_all([dir1, dir2, dir3, dir4, dir5])
            db.commit()
            print("    ✓ Direcciones de ejemplo insertadas")
        else:
            print("  ⊘ Direcciones ya existen, saltando...")

        # Locales de ejemplo
        if db.query(Local).count() == 0:
            print("  → Insertando Locales de ejemplo...")
            local1 = Local(id_direccion=1, id_tipo_local=1, nombre="El Gran Sabor", telefono=123456789, correo="contacto@gransabor.cl")
            local2 = Local(id_direccion=2, id_tipo_local=2, nombre="Bar La Terraza", telefono=987654321, correo="reservas@laterraza.cl")
            local3 = Local(id_direccion=3, id_tipo_local=3, nombre="Café del Parque", telefono=555666777, correo="info@cafeparque.com")
            local4 = Local(id_direccion=4, id_tipo_local=1, nombre="Rincón Peruano", telefono=111222333, correo="contacto@rinconperuano.cl")
            local5 = Local(id_direccion=5, id_tipo_local=2, nombre="The Old Pub", telefono=444555666, correo="contact@theoldpub.com")
            db.add_all([local1, local2, local3, local4, local5])
            db.commit()
            print("    ✓ Locales de ejemplo insertados")
        else:
            print("  ⊘ Locales ya existen, saltando...")
        
        print("\nBase de datos poblada exitosamente!")
        
    except Exception as e:
        print(f"\nError al poblar la base de datos: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    # Cargar variables de entorno
    load_dotenv()
    
    # Ejecutar seed
    seed_database()