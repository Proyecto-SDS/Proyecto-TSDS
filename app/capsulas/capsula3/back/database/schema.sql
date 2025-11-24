-- 1. Tablas independientes (sin llaves foráneas)
-- Habilitar PostGIS (si la base de datos PostgreSQL lo soporta)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Nota: Esta versión del esquema añade una columna `geom` (geography POINT)
-- en la tabla `direccion` y crea un índice GiST para consultas espaciales.

CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE comuna (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE tipo_foto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- 2. Tablas con dependencias de nivel 1

CREATE TABLE direccion (
    id SERIAL PRIMARY KEY,
    id_comuna INT NOT NULL,
    numero INT,
    longitud DECIMAL,
    latitud DECIMAL,
    geom geography(POINT,4326),
    CONSTRAINT fk_direccion_comuna FOREIGN KEY (id_comuna) REFERENCES comuna(id)
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100),
    correo VARCHAR(100),
    contrasena VARCHAR(200), -- Hash
    telefono VARCHAR(32),
    creado_el TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id)
);

CREATE TABLE local (
    id SERIAL PRIMARY KEY,
    id_direccion INT NOT NULL,
    nombre VARCHAR(200),
    telefono INT, -- Sugerencia: Cambiar a VARCHAR para soportar formatos internacionales
    correo VARCHAR(50),
    CONSTRAINT fk_local_direccion FOREIGN KEY (id_direccion) REFERENCES direccion(id)
);

-- 3. Tablas dependientes de Local y Usuario

CREATE TABLE tipo_local (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    CONSTRAINT fk_tipo_local_local FOREIGN KEY (id_local) REFERENCES local(id)
);

CREATE TABLE horario (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    dia_semana SMALLINT, -- 1-7
    hora_apertura TIME,
    hora_cierre TIME,
    abierto BOOLEAN,
    CONSTRAINT fk_horario_local FOREIGN KEY (id_local) REFERENCES local(id)
);

CREATE TABLE redes (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    nombre VARCHAR(50),
    url TEXT,
    CONSTRAINT fk_redes_local FOREIGN KEY (id_local) REFERENCES local(id)
);

CREATE TABLE foto (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    id_tipo_foto INT NOT NULL,
    ruta TEXT,
    CONSTRAINT fk_foto_local FOREIGN KEY (id_local) REFERENCES local(id),
    CONSTRAINT fk_foto_tipo FOREIGN KEY (id_tipo_foto) REFERENCES tipo_foto(id)
);

CREATE TABLE producto (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100),
    descripcion VARCHAR(500),
    estado VARCHAR(50), -- ENUM en diagrama
    precio BIGINT,
    disponible BOOLEAN,
    CONSTRAINT fk_producto_local FOREIGN KEY (id_local) REFERENCES local(id),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id)
);

CREATE TABLE mesa (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    nombre VARCHAR(30),
    capacidad SMALLINT,
    estado VARCHAR(50), -- ENUM en diagrama
    CONSTRAINT fk_mesa_local FOREIGN KEY (id_local) REFERENCES local(id)
);

CREATE TABLE opinion (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_local INT NOT NULL,
    puntuacion NUMERIC(2,1),
    comentario VARCHAR(500),
    creado_el TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    eliminado_el TIMESTAMPTZ,
    CONSTRAINT fk_opinion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_opinion_local FOREIGN KEY (id_local) REFERENCES local(id)
);

CREATE TABLE favorito (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_local INT NOT NULL,
    agregado_el TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorito_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_favorito_local FOREIGN KEY (id_local) REFERENCES local(id)
);

CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_reserva DATE,
    hora_reserva TIME,
    estado VARCHAR(50), -- ENUM en diagrama
    creada_el TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expirado_el TIMESTAMPTZ,
    CONSTRAINT fk_reserva_local FOREIGN KEY (id_local) REFERENCES local(id),
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

-- 4. Tablas transaccionales complejas (Pedidos, Pagos, etc.)

CREATE TABLE reserva_mesa (
    id SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_mesa INT NOT NULL,
    prioridad SMALLINT,
    CONSTRAINT fk_reserva_mesa_reserva FOREIGN KEY (id_reserva) REFERENCES reserva(id),
    CONSTRAINT fk_reserva_mesa_mesa FOREIGN KEY (id_mesa) REFERENCES mesa(id)
);

CREATE TABLE pedido (
    id SERIAL PRIMARY KEY,
    id_local INT NOT NULL,
    id_usuario INT NOT NULL,
    id_mesa INT, -- Puede ser nulo si es para llevar/delivery?
    fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50), -- ENUM en diagrama
    total BIGINT,
    CONSTRAINT fk_pedido_local FOREIGN KEY (id_local) REFERENCES local(id),
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_pedido_mesa FOREIGN KEY (id_mesa) REFERENCES mesa(id)
);

CREATE TABLE estado_pedido (
    id SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    creado_por INT, -- Referencia a usuario o sistema
    estado VARCHAR(50), -- ENUM en diagrama
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_estado_pedido_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id)
);

CREATE TABLE qr_dinamico (
    id SERIAL PRIMARY KEY,
    id_mesa INT NOT NULL,
    id_pedido INT, -- Marcado como (N) en diagrama
    codigo TEXT,
    expiracion TIMESTAMPTZ,
    activo BOOLEAN,
    CONSTRAINT fk_qr_mesa FOREIGN KEY (id_mesa) REFERENCES mesa(id),
    CONSTRAINT fk_qr_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id)
);

CREATE TABLE pago (
    id SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_reserva INT,
    metodo VARCHAR(50), -- ENUM en diagrama
    monto BIGINT,
    estado VARCHAR(50), -- ENUM en diagrama
    registrado_el TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id),
    CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES reserva(id)
);

-- Tabla que representa el detalle del pedido (Items)
CREATE TABLE cuenta (
    id SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT,
    subtotal BIGINT,
    observaciones VARCHAR(500),
    CONSTRAINT fk_cuenta_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id),
    CONSTRAINT fk_cuenta_producto FOREIGN KEY (id_producto) REFERENCES producto(id)
);

CREATE TABLE encomienda (
    id SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    estado VARCHAR(50), -- ENUM
    creado_el TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_encomienda_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id)
);

-- Tabla intermedia entre Cuenta y Encomienda
CREATE TABLE encomienda_cuenta (
    id SERIAL PRIMARY KEY,
    id_cuenta INT NOT NULL,
    id_encomienda INT NOT NULL,
    CONSTRAINT fk_encomienda_cuenta_cuenta FOREIGN KEY (id_cuenta) REFERENCES cuenta(id),
    CONSTRAINT fk_encomienda_cuenta_encomienda FOREIGN KEY (id_encomienda) REFERENCES encomienda(id)
);

-- Poblar la columna geom desde latitud/longitud y crear índice GiST
-- Ejecutar estas sentencias una sola vez después de haber migrado el esquema
-- (las funciones asumen que latitud y longitud están en formato decimal).

-- Actualizar geom a partir de lat/long
UPDATE direccion
SET geom = ST_SetSRID(ST_MakePoint(longitud::double precision, latitud::double precision), 4326)::geography
WHERE longitud IS NOT NULL AND latitud IS NOT NULL;

-- Crear índice geoespacial para búsquedas por distancia
CREATE INDEX IF NOT EXISTS idx_direccion_geom ON direccion USING GIST(geom);