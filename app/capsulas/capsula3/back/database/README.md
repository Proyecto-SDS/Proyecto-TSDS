# Base de Datos

## Schema

El archivo `schema.sql` contiene la definición completa de la base de datos con 24 tablas.

## Uso

### Crear base de datos

```powershell
$env:PGPASSWORD="tu_password"; C:\Program Files\PostgreSQL\18\bin\createdb.exe -U postgres reservaya
```

### Ejecutar schema

```powershell
$env:PGPASSWORD="tu_password"; C:\Program Files\PostgreSQL\18\bin\psql.exe -U postgres -d reservaya -f database/schema.sql
```

## Tablas Principales

- **usuario**, **rol** - Usuarios y roles
- **comuna**, **direccion** - Ubicaciones
- **local**, **horario**, **mesa** - Restaurantes y mesas
- **producto**, **categoria** - Menú y categorías
- **reserva**, **reserva_mesa** - Reservas
- **opinion**, **favorito** - Opiniones y favoritos
- **foto**, **tipo_foto** - Fotografías

## Base de Datos Remota

Para usar una base de datos hosteada:

1. **Actualizar `.env`** del backend con la URL remota:
```env
DATABASE_URL=postgresql://usuario:password@host:puerto/database
```

2. **Ejecutar schema** en la base de datos remota:
   - Opción A: Usar panel web del hosting (Railway UI, pgAdmin, etc.)
   - Opción B: Conectar con psql remoto:
     ```powershell
     psql "postgresql://usuario:password@host:puerto/database" -f database/schema.sql
     ```
