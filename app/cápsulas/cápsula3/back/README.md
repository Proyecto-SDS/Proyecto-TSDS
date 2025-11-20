# API ReservaYa - Backend

API REST para el sistema de reservas de restaurantes. Proporciona endpoints para gestionar locales, usuarios, reservas y búsquedas.

##  Inicio Rápido

### Requisitos Previos
- Python 3.12+
- PostgreSQL 18 (local o remoto)
- pip

### 1️⃣ Instalar Dependencias

```powershell
# Navegar al directorio del backend
cd app/cápsulas/cápsula3/back

# Instalar pipenv
pip install pipenv

# Instalar dependencias del proyecto
python -m pipenv install
```

### 2️⃣ Configurar Base de Datos

Crear archivo `.env` en la carpeta `back/`:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/reservaya
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
PORT=5000
```

**Opción A: Base de datos local**
```powershell
# Crear base de datos
$env:PGPASSWORD="tu_password"; createdb -U postgres reservaya

# Ejecutar schema
$env:PGPASSWORD="tu_password"; psql -U postgres -d reservaya -f database/schema.sql

# Poblar datos de prueba
python -m pipenv run python scripts/seed.py
```

**Opción B: Base de datos remota (Railway, Render, AWS, etc.)**
```env
# Actualizar DATABASE_URL en .env con la URL proporcionada por el servicio
DATABASE_URL=postgresql://usuario:password@host.railway.app:5432/railway

# Ejecutar schema manualmente desde la interfaz web del servicio
# o conectarse remotamente:
psql "postgresql://usuario:password@host:puerto/db" -f database/schema.sql
```

### 3️⃣ Iniciar Servidor

```powershell
# Desde el directorio back/
$env:PIPENV_PIPFILE = "$PWD\Pipfile"
python -m pipenv run python run.py
```

 **Servidor corriendo en:** `http://localhost:5000`

###  Probar API

Abre en tu navegador:
- http://localhost:5000/api/locales - Ver todos los restaurantes
- http://localhost:5000/api/locales/1 - Ver detalle del restaurante 1
- http://localhost:5000/api/search?q=cafe - Buscar restaurantes


##  Documentación de la API

###  Locales (Restaurantes)

#### Listar todos los locales
```http
GET /api/locales
```

**Filtros opcionales:**
- `?tipo=Cafetería` - Filtrar por tipo de local
- `?comuna=Santiago` - Filtrar por comuna
- `?categoria=Italiana` - Filtrar por categoría de comida

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "King Halo",
    "tipo": "Restaurante",
    "direccion": "Av. Principal 123",
    "comuna": "Santiago",
    "telefono": "+56912345678",
    "rating": 4.8,
    "horario_apertura": "11:00",
    "horario_cierre": "22:00"
  }
]
```

#### Obtener detalle de un local
```http
GET /api/locales/{id}
```

#### Obtener mesas disponibles
```http
GET /api/locales/{id}/mesas
```

#### Obtener menú/productos
```http
GET /api/locales/{id}/productos
```

### 👤 Usuarios

#### Crear usuario
```http
POST /api/usuarios
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "+56912345678",
  "password": "password123"
}
```

#### Obtener reservas de un usuario
```http
GET /api/usuarios/{id}/reservas
```

#### Obtener favoritos de un usuario
```http
GET /api/usuarios/{id}/favoritos
```

###  Reservas

#### Crear reserva
```http
POST /api/reservas
Content-Type: application/json

{
  "usuario_id": 1,
  "local_id": 1,
  "mesa_id": 1,
  "fecha": "2025-11-20",
  "hora": "19:00",
  "num_personas": 4,
  "productos": [
    {"producto_id": 1, "cantidad": 2},
    {"producto_id": 2, "cantidad": 1}
  ]
}
```

**Respuesta:**
```json
{
  "id": 1,
  "codigo_qr": "RSV-20251120-001",
  "total": 45000,
  "estado": "confirmada"
}
```

#### Verificar disponibilidad
```http
GET /api/reservas/disponibilidad?local_id=1&fecha=2025-11-20&hora=19:00&personas=4
```

#### Actualizar estado de reserva
```http
PATCH /api/reservas/{id}
Content-Type: application/json

{
  "estado": "completada"
}
```

Estados válidos: `confirmada`, `completada`, `cancelada`

### 🔍 Búsqueda

#### Buscar locales
```http
GET /api/search?q=pizza&tipo=Restaurante&categoria=Italiana
```

### 🛠️ Utilidades

#### Listar comunas disponibles
```http
GET /api/comunas
```

#### Listar categorías de comida
```http
GET /api/categorias
```

## 🗄️ Estructura del Proyecto

```
back/
├── app/
│   ├── __init__.py          # Inicialización de Flask + CORS
│   ├── config.py            # Configuración de la app
│   ├── models/              # Modelos (sin usar por ahora)
│   └── routes/
│       ├── locales.py       # Endpoints de restaurantes
│       ├── usuarios.py      # Endpoints de usuarios
│       ├── reservas.py      # Endpoints de reservas
│       └── search.py        # Endpoints de búsqueda
├── database/
│   ├── schema.sql           # Schema de la BD
│   └── README.md
├── scripts/
│   └── seed.py              # Datos de prueba
├── migrations/              # Alembic (sin usar)
├── run.py                   # Punto de entrada
├── Pipfile                  # Dependencias
└── .env                     # Variables de entorno (crear este)
```

## 🔧 Tecnologías Utilizadas

- **Flask 3.0.3** - Framework web
- **PostgreSQL 18** - Base de datos
- **psycopg2** - Adaptador PostgreSQL
- **Flask-CORS** - Manejo de CORS para el frontend
- **python-dotenv** - Variables de entorno

##  Notas Importantes

1. **CORS está habilitado** para permitir peticiones desde el frontend
2. Las **consultas SQL son directas** (sin ORM) para mayor control
3. El servidor corre en modo **debug** en desarrollo
4. Todos los endpoints devuelven **JSON**
5. Los datos de prueba se cargan con `seed.py`

##  Troubleshooting

**Problema:** `ModuleNotFoundError: No module named 'flask'`
```powershell
# Solución: Instalar dependencias
python -m pipenv install
```

**Problema:** Error de conexión a la base de datos
```powershell
# Verificar que PostgreSQL está corriendo
# Verificar credenciales en .env
# Verificar que la base de datos existe
psql -U postgres -l
```

**Problema:** `pipenv: command not found`
```powershell
# Instalar pipenv
pip install pipenv
```

##  Para Producción

1. Cambiar `SECRET_KEY` en `.env`
2. Configurar `FLASK_ENV=production`
3. Usar un servidor WSGI como **Gunicorn**:
```powershell
python -m pipenv run gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

