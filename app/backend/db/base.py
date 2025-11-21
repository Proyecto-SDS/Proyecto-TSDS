from sqlalchemy.orm import declarative_base

Base = declarative_base()

# modelos importados para que SQLAlchemy los reconozca
from modelos.rol import Rol

from modelos.usuario import Usuario
from modelos.opinion import Opinion
from modelos.favorito import Favorito
from modelos.pago import Pago

from modelos.reserva import Reserva
from modelos.pedido import Pedido
from modelos.estado_pedido import Estado_Pedido
from modelos.cuenta import Cuenta
from modelos.encomienda_cuenta import Encomienda_Cuenta

from modelos.reserva_mesa import Reserva_Mesa
from modelos.mesa import Mesa
from modelos.qr_dinamico import QR_Dinamico
from modelos.producto import Producto
from modelos.encomienda import Encomienda

from modelos.tipo_local import Tipo_Local
from modelos.local import Local
from modelos.horario import Horario
from modelos.categoria import Categoria

from modelos.direccion import Direccion
from modelos.redes import Redes
from modelos.foto import Foto

from modelos.comuna import Comuna
from modelos.tipo_red import Tipo_Red
from modelos.tipo_foto import Tipo_Foto