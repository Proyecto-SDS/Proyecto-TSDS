"""
Modelos de SQLAlchemy para ReservaYa

Este archivo importa todos los modelos para que Flask-Migrate
los reconozca automáticamente.
"""

from app import db
from datetime import datetime
from sqlalchemy import event
from geoalchemy2 import Geography, WKTElement

# Tablas independientes (sin llaves foráneas)

class Rol(db.Model):
    __tablename__ = 'rol'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    
    # Relaciones
    usuarios = db.relationship('Usuario', backref='rol', lazy=True)
    
    def __repr__(self):
        return f'<Rol {self.nombre}>'


class Comuna(db.Model):
    __tablename__ = 'comuna'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    
    # Relaciones
    direcciones = db.relationship('Direccion', backref='comuna', lazy=True)
    
    def __repr__(self):
        return f'<Comuna {self.nombre}>'


class Categoria(db.Model):
    __tablename__ = 'categoria'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    
    # Relaciones
    productos = db.relationship('Producto', backref='categoria', lazy=True)
    
    def __repr__(self):
        return f'<Categoria {self.nombre}>'


class TipoFoto(db.Model):
    __tablename__ = 'tipo_foto'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    
    # Relaciones
    fotos = db.relationship('Foto', backref='tipo_foto', lazy=True)
    
    def __repr__(self):
        return f'<TipoFoto {self.nombre}>'


# Tablas con dependencias de nivel 1

class Direccion(db.Model):
    __tablename__ = 'direccion'
    
    id = db.Column(db.Integer, primary_key=True)
    id_comuna = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)
    numero = db.Column(db.Integer)
    longitud = db.Column(db.Numeric)
    latitud = db.Column(db.Numeric)
    geom = db.Column(Geography(geometry_type='POINT', srid=4326))
    
    # Relaciones
    locales = db.relationship('Local', backref='direccion', lazy=True)
    
    def __repr__(self):
        return f'<Direccion {self.id}>'


@event.listens_for(Direccion, 'before_insert')
@event.listens_for(Direccion, 'before_update')
def _direccion_set_geom(mapper, connection, target):
    """Asegura que la columna `geom` se mantenga coherente con latitud/longitud.

    Se asigna un WKTElement para que GeoAlchemy lo procese apropiadamente.
    """
    try:
        if target.longitud is not None and target.latitud is not None:
            lon = float(target.longitud)
            lat = float(target.latitud)
            target.geom = WKTElement(f'POINT({lon} {lat})', srid=4326)
    except Exception:
        # No fallar la operación de persistencia por problemas en los valores
        target.geom = None


class Usuario(db.Model):
    __tablename__ = 'usuario'
    
    id = db.Column(db.Integer, primary_key=True)
    id_rol = db.Column(db.Integer, db.ForeignKey('rol.id'), nullable=False)
    nombre = db.Column(db.String(100))
    correo = db.Column(db.String(100))
    contrasena = db.Column(db.String(200))  # Hash
    telefono = db.Column(db.String(32))
    creado_el = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    # Relaciones
    opiniones = db.relationship('Opinion', backref='usuario', lazy=True)
    favoritos = db.relationship('Favorito', backref='usuario', lazy=True)
    reservas = db.relationship('Reserva', backref='usuario', lazy=True)
    pedidos = db.relationship('Pedido', backref='usuario', lazy=True)
    
    def __repr__(self):
        return f'<Usuario {self.nombre}>'


class Local(db.Model):
    __tablename__ = 'local'
    
    id = db.Column(db.Integer, primary_key=True)
    id_direccion = db.Column(db.Integer, db.ForeignKey('direccion.id'), nullable=False)
    nombre = db.Column(db.String(200))
    telefono = db.Column(db.Integer)  # Considerar cambiar a VARCHAR
    correo = db.Column(db.String(50))
    
    # Relaciones
    tipos_local = db.relationship('TipoLocal', backref='local', lazy=True)
    horarios = db.relationship('Horario', backref='local', lazy=True)
    redes = db.relationship('Redes', backref='local', lazy=True)
    fotos = db.relationship('Foto', backref='local', lazy=True)
    productos = db.relationship('Producto', backref='local', lazy=True)
    mesas = db.relationship('Mesa', backref='local', lazy=True)
    opiniones = db.relationship('Opinion', backref='local', lazy=True)
    favoritos = db.relationship('Favorito', backref='local', lazy=True)
    reservas = db.relationship('Reserva', backref='local', lazy=True)
    pedidos = db.relationship('Pedido', backref='local', lazy=True)
    
    def __repr__(self):
        return f'<Local {self.nombre}>'


# Tablas dependientes de Local y Usuario

class TipoLocal(db.Model):
    __tablename__ = 'tipo_local'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    
    def __repr__(self):
        return f'<TipoLocal {self.id}>'


class Horario(db.Model):
    __tablename__ = 'horario'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    dia_semana = db.Column(db.SmallInteger)  # 1-7
    hora_apertura = db.Column(db.Time)
    hora_cierre = db.Column(db.Time)
    abierto = db.Column(db.Boolean)
    
    def __repr__(self):
        return f'<Horario {self.id_local} - Día {self.dia_semana}>'


class Redes(db.Model):
    __tablename__ = 'redes'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    nombre = db.Column(db.String(50))
    url = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Redes {self.nombre}>'


class Foto(db.Model):
    __tablename__ = 'foto'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    id_tipo_foto = db.Column(db.Integer, db.ForeignKey('tipo_foto.id'), nullable=False)
    ruta = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Foto {self.id}>'


class Producto(db.Model):
    __tablename__ = 'producto'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)
    nombre = db.Column(db.String(100))
    descripcion = db.Column(db.String(500))
    estado = db.Column(db.String(50))  # ENUM
    precio = db.Column(db.BigInteger)
    disponible = db.Column(db.Boolean)
    
    # Relaciones
    cuentas = db.relationship('Cuenta', backref='producto', lazy=True)
    
    def __repr__(self):
        return f'<Producto {self.nombre}>'


class Mesa(db.Model):
    __tablename__ = 'mesa'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    nombre = db.Column(db.String(30))
    capacidad = db.Column(db.SmallInteger)
    estado = db.Column(db.String(50))  # ENUM
    
    # Relaciones
    reservas_mesa = db.relationship('ReservaMesa', backref='mesa', lazy=True)
    pedidos = db.relationship('Pedido', backref='mesa', lazy=True)
    qr_dinamicos = db.relationship('QRDinamico', backref='mesa', lazy=True)
    
    def __repr__(self):
        return f'<Mesa {self.nombre}>'


class Opinion(db.Model):
    __tablename__ = 'opinion'
    
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    puntuacion = db.Column(db.Numeric(2, 1))
    comentario = db.Column(db.String(500))
    creado_el = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    eliminado_el = db.Column(db.DateTime(timezone=True))
    
    def __repr__(self):
        return f'<Opinion {self.id}>'


class Favorito(db.Model):
    __tablename__ = 'favorito'
    
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    agregado_el = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Favorito {self.id}>'


class Reserva(db.Model):
    __tablename__ = 'reserva'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    fecha_reserva = db.Column(db.Date)
    hora_reserva = db.Column(db.Time)
    estado = db.Column(db.String(50))  # ENUM
    creada_el = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    expirado_el = db.Column(db.DateTime(timezone=True))
    
    # Relaciones
    reservas_mesa = db.relationship('ReservaMesa', backref='reserva', lazy=True)
    pagos = db.relationship('Pago', backref='reserva', lazy=True)
    
    def __repr__(self):
        return f'<Reserva {self.id}>'


# Tablas transaccionales complejas

class ReservaMesa(db.Model):
    __tablename__ = 'reserva_mesa'
    
    id = db.Column(db.Integer, primary_key=True)
    id_reserva = db.Column(db.Integer, db.ForeignKey('reserva.id'), nullable=False)
    id_mesa = db.Column(db.Integer, db.ForeignKey('mesa.id'), nullable=False)
    prioridad = db.Column(db.SmallInteger)
    
    def __repr__(self):
        return f'<ReservaMesa {self.id}>'


class Pedido(db.Model):
    __tablename__ = 'pedido'
    
    id = db.Column(db.Integer, primary_key=True)
    id_local = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    id_mesa = db.Column(db.Integer, db.ForeignKey('mesa.id'))
    fecha = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    estado = db.Column(db.String(50))  # ENUM
    total = db.Column(db.BigInteger)
    
    # Relaciones
    estados_pedido = db.relationship('EstadoPedido', backref='pedido', lazy=True)
    qr_dinamicos = db.relationship('QRDinamico', backref='pedido', lazy=True)
    pagos = db.relationship('Pago', backref='pedido', lazy=True)
    cuentas = db.relationship('Cuenta', backref='pedido', lazy=True)
    encomiendas = db.relationship('Encomienda', backref='pedido', lazy=True)
    
    def __repr__(self):
        return f'<Pedido {self.id}>'


class EstadoPedido(db.Model):
    __tablename__ = 'estado_pedido'
    
    id = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    creado_por = db.Column(db.Integer)  # Referencia a usuario o sistema
    estado = db.Column(db.String(50))  # ENUM
    creado_en = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    def __repr__(self):
        return f'<EstadoPedido {self.id}>'


class QRDinamico(db.Model):
    __tablename__ = 'qr_dinamico'
    
    id = db.Column(db.Integer, primary_key=True)
    id_mesa = db.Column(db.Integer, db.ForeignKey('mesa.id'), nullable=False)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id'))
    codigo = db.Column(db.Text)
    expiracion = db.Column(db.DateTime(timezone=True))
    activo = db.Column(db.Boolean)
    
    def __repr__(self):
        return f'<QRDinamico {self.id}>'


class Pago(db.Model):
    __tablename__ = 'pago'
    
    id = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    id_reserva = db.Column(db.Integer, db.ForeignKey('reserva.id'))
    metodo = db.Column(db.String(50))  # ENUM
    monto = db.Column(db.BigInteger)
    estado = db.Column(db.String(50))  # ENUM
    registrado_el = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Pago {self.id}>'


class Cuenta(db.Model):
    __tablename__ = 'cuenta'
    
    id = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Integer)
    subtotal = db.Column(db.BigInteger)
    observaciones = db.Column(db.String(500))
    
    # Relaciones
    encomiendas_cuenta = db.relationship('EncomiendaCuenta', backref='cuenta', lazy=True)
    
    def __repr__(self):
        return f'<Cuenta {self.id}>'


class Encomienda(db.Model):
    __tablename__ = 'encomienda'
    
    id = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    estado = db.Column(db.String(50))  # ENUM
    creado_el = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    # Relaciones
    encomiendas_cuenta = db.relationship('EncomiendaCuenta', backref='encomienda', lazy=True)
    
    def __repr__(self):
        return f'<Encomienda {self.id}>'


class EncomiendaCuenta(db.Model):
    __tablename__ = 'encomienda_cuenta'
    
    id = db.Column(db.Integer, primary_key=True)
    id_cuenta = db.Column(db.Integer, db.ForeignKey('cuenta.id'), nullable=False)
    id_encomienda = db.Column(db.Integer, db.ForeignKey('encomienda.id'), nullable=False)
    
    def __repr__(self):
        return f'<EncomiendaCuenta {self.id}>'
