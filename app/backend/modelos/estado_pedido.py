from sqlalchemy import Column, Integer, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.base import Base
import enum

class Estado_PedidoEnum(enum.Enum):
    CREADO = "abierto"
    EN_PREPARACION = "en_preparacion"
    LISTO = "listo"
    ENTREGADO = "entregado"
    CERRADO = "cerrado"
    CANCELADO = "cancelado"

class Estado_Pedido(Base):

    __tablename__ = "estado_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedido.id", ondelete="CASCADE"), nullable=False)
    estado = Column(Enum(Estado_PedidoEnum, name="estado_pedido_enum"), nullable=False)
    creado_el = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    pedido = relationship("Pedido", back_populates="estados_pedido", lazy="joined")
    creado_por_usuario = relationship("Usuario", back_populates="estados_pedido", lazy="joined")

    def __repr__(self):
        return f"<Estado_Pedido id={self.id} pedido={self.pedido_id} estado='{self.estado}' creado_por={self.creado_por} creado_el={self.creado_el}>"