# Taller Sistema Software - ReservaYa

Sistema completo de gestión y reservas para locales comerciales, desarrollado como proyecto del Taller de Sistemas de Software.

## 📋 Descripción

ReservaYa es una plataforma que permite a los usuarios buscar, explorar y realizar reservas en diferentes tipos de establecimientos (restaurantes, cafeterías, bares, etc.). El sistema cuenta con funcionalidades de:

- 🔍 Búsqueda y filtrado de establecimientos por comuna y tipo
- 📍 Visualización en mapa interactivo con Mapbox
- ⭐ Sistema de calificaciones y opiniones
- 📅 Gestión de reservas de mesas
- 👤 Perfiles de usuario con autenticación
- 📸 Galería de fotos de establecimientos
- 🍽️ Visualización de menús/productos

## 🏗️ Arquitectura

El proyecto está organizado en un workspace multi-root con dos carpetas principales:

```
taller-sistema-software/
├── backend/          # API REST con Flask + PostgreSQL
└── frontend/         # Aplicación web con Next.js + React
```

### Backend

- **Framework**: Flask 3.0.3
- **ORM**: SQLAlchemy 2.0.29
- **Base de Datos**: PostgreSQL 18
- **Migraciones**: Alembic 1.17.2
- **Validación**: Pydantic 2.12.4
- **Despliegue**: Docker + Docker Compose

### Frontend

- **Framework**: Next.js 16.0.4 (App Router)
- **UI Library**: React 19.2.0
- **Lenguaje**: TypeScript 5.9.3
- **Estilos**: Tailwind CSS 4.x
- **Componentes**: Radix UI + shadcn/ui
- **Mapas**: Mapbox GL 3.16.0
- **Forms**: React Hook Form 7.55.0

## 🚀 Inicio Rápido

### Prerequisitos

- **Backend**:
  - Docker Desktop (incluye Docker Compose)
- **Frontend**:
  - Node.js 20.x o superior
  - npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/Proyecto-SDS/Proyecto-TSDS.git
cd Proyecto-TSDS
```

### 2. Configurar Backend

```bash
cd backend

# Copiar archivo de ejemplo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de base de datos
# (usa tu editor preferido)

# Construir imágenes Docker
docker-compose build

# Levantar PostgreSQL
docker-compose up db -d

# Esperar ~5 segundos hasta que PostgreSQL esté listo

# Inicializar base de datos (crear tablas y datos iniciales)
docker-compose --profile init run --rm init-db

# Levantar el servidor backend
docker-compose up backend
```

El backend estará disponible en `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd frontend

# Copiar archivo de ejemplo de variables de entorno
cp .env.local.example .env.local

# Editar .env.local con:
# - NEXT_PUBLIC_API_URL=http://localhost:5000
# - NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_token

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📚 Documentación Detallada

### Backend

Para información detallada sobre configuración, migraciones, API endpoints y uso con Docker, consulta:

- [Backend README](./backend/README.md)

### Frontend

Para información sobre la estructura del proyecto, componentes, rutas y tecnologías utilizadas, consulta:

- [Frontend README](./frontend/README.md)

## 🛠️ Scripts Útiles

### Backend (con Docker)

```bash
# Ver logs del backend
docker-compose logs -f backend

# Crear una nueva migración
docker-compose run --rm app alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
docker-compose run --rm app alembic upgrade head

# Acceder al shell de Python en el contenedor
docker-compose run --rm app python

# Detener todos los servicios
docker-compose down

# Reset completo (borra todos los datos)
docker-compose down -v
```

### Frontend

```bash
# Desarrollo con hot-reload
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Linter
npm run lint
```

## 🗂️ Estructura del Workspace

```
taller-sistema-software/
├── .vscode/
│   └── settings.json                    # Configuración de VS Code
├── taller-sistema-software.code-workspace  # Workspace multi-root
├── backend/
│   ├── src/
│   │   ├── models/                     # Modelos SQLAlchemy
│   │   ├── routes/                     # Blueprints de Flask
│   │   ├── services/                   # Lógica de negocio
│   │   ├── db/                         # Seed data
│   │   ├── database.py                 # Configuración DB
│   │   └── main.py                     # Entry point
│   ├── alembic/                        # Migraciones
│   ├── scripts/                        # Scripts de inicialización
│   ├── docker-compose.yml              # Orquestación Docker
│   ├── Dockerfile.python               # Imagen Docker
│   └── requirements.txt                # Dependencias Python
└── frontend/
    ├── src/
    │   ├── app/                        # App Router (páginas)
    │   ├── components/                 # Componentes React
    │   ├── context/                    # Context API (Auth)
    │   ├── screens/                    # Pantallas complejas
    │   ├── types/                      # Tipos TypeScript
    │   └── utils/                      # Utilidades (API client)
    ├── middleware.ts                   # Middleware Next.js
    ├── tailwind.config.ts              # Configuración Tailwind
    ├── tsconfig.json                   # Configuración TypeScript
    └── package.json                    # Dependencias Node
```

## 🔑 Variables de Entorno

### Backend (.env)

```env
# Base de Datos
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=localhost  # 'db' dentro de Docker
DB_PORT=5432
DB_NAME=mydb

# PostgreSQL (Docker)
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb

# Entorno
ENV=dev
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_token_de_mapbox
```

## 👥 Equipo de Desarrollo

Proyecto desarrollado por el equipo del Taller de Sistemas de Software.

**Repositorio**: [Proyecto-SDS/Proyecto-TSDS](https://github.com/Proyecto-SDS/Proyecto-TSDS)

**Rama actual**: new-dev  
**Rama principal**: Develop

## 📝 Licencia

Este proyecto es privado y está desarrollado con fines educativos.

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crea una rama desde `Develop`
2. Realiza tus cambios
3. Asegúrate de que el código esté formateado (Prettier para frontend, autopep8 para backend)
4. Crea un Pull Request hacia `Develop`

## ❓ Soporte

Para dudas o problemas:

- Revisa la documentación en los README de cada carpeta
- Consulta los logs de Docker: `docker-compose logs -f`
- Verifica las variables de entorno

## 🔄 Estado del Proyecto

✅ Backend API funcional  
✅ Frontend con diseño completo  
✅ Autenticación de usuarios  
✅ Sistema de reservas  
✅ Integración con Mapbox  
🚧 En desarrollo continuo
