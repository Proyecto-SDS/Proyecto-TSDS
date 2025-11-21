from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Base general para todos los schemas.

class SchemaBase(BaseModel):
    class Config:
        orm_mode = True

class TimestampMixin(BaseModel):
    creado_el: Optional[datetime] = None
    actualizado_el: Optional[datetime] = None

class SoftDeleteMixin(BaseModel):
    eliminado_el: Optional[datetime] = None