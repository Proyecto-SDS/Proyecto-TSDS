from db.sesion import SesionLocal
from modelos.rol import Rol
from modelos.tipo_local import Tipo_Local
from modelos.comuna import Comuna
from modelos.tipo_red import Tipo_Red
from modelos.tipo_foto import Tipo_Foto

def tablas_fijas():
    db = SesionLocal()
    try:

        # Roles
        existing = db.query(Rol).count()
        if existing == 0:
            db.add_all([
                Rol(nombre="admin"),
                Rol(nombre="mesero"),
                Rol(nombre="cliente"),
            ])

        # Tipo_Local
        if db.query(Tipo_Local).count() == 0:
            db.add_all([
                Tipo_Local(nombre="Restaurante"),
                Tipo_Local(nombre="Bar"),
                Tipo_Local(nombre="Cafetería"),
            ])

        # Comunas
        if db.query(Comuna).count() == 0:
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
                Comuna(nombre="Vitacura")
            ])

        # Tipo_Red
        if db.query(Tipo_Red).count() == 0:
            db.add_all([
                Tipo_Red(nombre="Sitio Web"),
                Tipo_Red(nombre="Instagram"),
                Tipo_Red(nombre="Facebook"),
                Tipo_Red(nombre="TikTok"),
                Tipo_Red(nombre="YouTube"),
                Tipo_Red(nombre="X/Twitter"),
                Tipo_Red(nombre="Whatsapp")
            ])

        # Tipo_Foto
        if db.query(Tipo_Foto).count() == 0:
            db.add_all([
                # imagen
                Tipo_Foto(nombre="banner"),
                Tipo_Foto(nombre="hero"),
                Tipo_Foto(nombre="icono"),
                Tipo_Foto(nombre="logo"),
                Tipo_Foto(nombre="promocion"),
                # producto
                Tipo_Foto(nombre="producto"),
                Tipo_Foto(nombre="ingredientes"),
                Tipo_Foto(nombre="menu"),
                # local
                Tipo_Foto(nombre="interior"),
                Tipo_Foto(nombre="exterior"),
                Tipo_Foto(nombre="fachada"),
                Tipo_Foto(nombre="mesa"),
                # staff del local
                Tipo_Foto(nombre="staff"),
            ])

        db.commit()
        
    finally:
        db.close()