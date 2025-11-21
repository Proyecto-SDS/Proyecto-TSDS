from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.base import Base


class Encomienda(Base):
    __tablename__ = "encomienda"

    id = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id", ondelete="CASCADE"), nullable=False, index=True)
    estado = Column(String(20), nullable=False)
    creado_el = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relaciones
    pedido = relationship("Pedido", back_populates="encomiendas", lazy="joined")
    cuentas_encomienda = relationship("Encomienda_Cuenta", back_populates="encomienda", lazy="select")

    def __repr__(self):
        return f"<Encomienda id={self.id} estado={self.estado} pedido={self.id_pedido}>"
