from typing import Optional
from pydantic import EmailStr, Field
from schemas.base import SchemaBase, TimestampMixin

class UsuarioBase(SchemaBase):
    nombre: str = Field(..., max_length=100)
    correo: EmailStr
    telefono: Optional[str] = None
    id_rol: Optional[int] = None

class UsuarioCreate(UsuarioBase):
    contrasena: str = Field(..., min_length=8)

class UsuarioUpdate(SchemaBase):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None
    telefono: Optional[str] = None
    id_rol: Optional[int] = None
    contrasena: Optional[str] = Field(None, min_length=8)  # si se actualiza, el servicio hash

class UsuarioResponse(UsuarioBase, TimestampMixin):
    id: int

    class Config(SchemaBase.Config):
        pass