"""Add geom geography column to direccion and create GiST index

Revision ID: 20251123_add_geom_direccion
Revises: 
Create Date: 2025-11-23 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251123_add_geom_direccion'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable PostGIS extension (no-op if already enabled)
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # Add geography column `geom` to `direccion`
    try:
        from geoalchemy2 import Geography
        geom_type = Geography(geometry_type='POINT', srid=4326)
    except Exception:
        # Fallback: create as generic column and set via SQL
        geom_type = None

    if geom_type is not None:
        op.add_column('direccion', sa.Column('geom', geom_type, nullable=True))
    else:
        # Use raw SQL to add the column as geography if geoalchemy2 not available
        op.execute("ALTER TABLE direccion ADD COLUMN IF NOT EXISTS geom geography(POINT,4326);")

    # Populate geom from existing longitud/latitud where available
    op.execute(
        """
        UPDATE direccion
        SET geom = ST_SetSRID(ST_MakePoint(longitud::double precision, latitud::double precision), 4326)::geography
        WHERE longitud IS NOT NULL AND latitud IS NOT NULL;
        """
    )

    # Create GiST index for fast spatial queries
    op.create_index('idx_direccion_geom', 'direccion', ['geom'], postgresql_using='gist')


def downgrade() -> None:
    # Drop GiST index
    op.drop_index('idx_direccion_geom', table_name='direccion')

    # Drop geom column
    op.drop_column('direccion', 'geom')

    # Note: we intentionally do not drop the postgis extension here