-- Enums para datos fijos del sistema

CREATE TYPE metodo_pago_enum AS ENUM (
    'efectivo',
    'transferencia',
    'debito',
    'credito',
    'app_de_pago',
    'otro'
);

CREATE TYPE estado_pago_enum AS ENUM (
    'pendiente',
    'cobrado',
    'cancelado'
);

CREATE TYPE estado_pedido_enum AS ENUM (
    'abierto',
    'en_preparacion',
    'listo',
    'entregado',
    'cerrado',
    'cancelado'
);

CREATE TYPE estado_mesa_enum AS ENUM (
    'disponible',
    'reservada',
    'ocupada',
    'fuera_de_servicio'
);

CREATE TYPE estado_reserva_enum AS ENUM (
    'pendiente',
    'confirmada',
    'rechazada'
);

CREATE TYPE estado_encomienda_enum AS ENUM (
    'pendiente',
    'en_preparacion',
    'lista',
    'entregada',
    'cancelada'
);

CREATE TYPE producto_estado_enum AS ENUM (
    'disponible',
    'agotado',
    'inactivo'
);

CREATE TYPE producto_estado_enum AS ENUM (
    'disponible',
    'agotado',
    'inactivo'
);

CREATE TYPE horario_tipo_enum AS ENUM (
    'normal',
    'especial',
    'evento',
    'cerrado'
);

--Tablas principales del sistema
CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipo_local (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE comuna (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE tipo_red (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE tipo_foto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    id_rol INTEGER, -- fk de rol
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(200) NOT NULL, -- hash
    telefono VARCHAR(32),
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id)
);

CREATE TABLE local (
    id SERIAL PRIMARY KEY,
    id_direccion INTEGER, -- fk de direccion
    id_tipo_local INTEGER, -- fk de tipo_local
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(32),
    correo VARCHAR(50),
    CONSTRAINT fk_local_tipo_local FOREIGN KEY (id_tipo_local) REFERENCES tipo_local(id),
    CONSTRAINT fk_local_direccion FOREIGN KEY (id_direccion) REFERENCES direccion(id)
);

CREATE TABLE direccion (
    id SERIAL PRIMARY KEY,
    id_comuna INTEGER, -- fk de comuna
    numero INTEGER,
    longitud DECIMAL,
    latitud DECIMAL,
    id_local INTEGER, -- fk a local
    CONSTRAINT fk_direccion_comuna FOREIGN KEY (id_comuna) REFERENCES comuna(id),
    CONSTRAINT fk_direccion_local FOREIGN KEY (id_local) REFERENCES local(id) ON DELETE CASCADE
);

CREATE TABLE redes (
    id SERIAL PRIMARY KEY,
    id_local INTEGER, -- fk de local
    id_foto INTEGER, -- fk 1:1 foto
    id_tipo_red INTEGER, -- fk de tipo_red
    url TEXT,
    CONSTRAINT fk_redes_local FOREIGN KEY (id_local) REFERENCES local(id) ON DELETE CASCADE,
    CONSTRAINT fk_redes_foto FOREIGN KEY (id_foto) REFERENCES foto(id),
    CONSTRAINT fk_redes_tipo_red FOREIGN KEY (id_tipo_red) REFERENCES tipo_red(id)
);

CREATE TABLE horario (
    id SERIAL PRIMARY KEY,
    id_local INTEGER,
    tipo horario_tipo_enum,
    fecha_inicio DATE,
    fecha_fin DATE,
    dia_semana SMALLINT,
    hora_apertura TIME,
    hora_cierre TIME,
    abierto BOOLEAN DEFAULT TRUE,
    nota VARCHAR(500), -- comentarios adicionales
    CONSTRAINT fk_horario_local FOREIGN KEY (id_local) REFERENCES local(id) ON DELETE CASCADE
);

CREATE TABLE producto (
    id SERIAL PRIMARY KEY,
    id_local INTEGER, -- fk de local
    id_categoria INTEGER, -- fk de categoria
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    estado producto_estado_enum,
    precio BIGINT,
    CONSTRAINT fk_producto_local FOREIGN KEY (id_local) REFERENCES local(id) ON DELETE CASCADE,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id)
);

CREATE TABLE foto (
    id SERIAL PRIMARY KEY,
    id_local INTEGER, -- fk de local
    id_producto INTEGER, -- fk de producto
    id_categoria INTEGER, -- fk de categoria
    id_tipo_foto INTEGER, -- fk de tipo_foto
    ruta TEXT,
    CONSTRAINT fk_foto_local FOREIGN KEY (id_local) REFERENCES local(id) ON DELETE CASCADE,
    CONSTRAINT fk_foto_producto FOREIGN KEY (id_producto) REFERENCES producto(id) ON DELETE CASCADE,
    CONSTRAINT fk_foto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE CASCADE,
    CONSTRAINT fk_foto_tipo FOREIGN KEY (id_tipo_foto) REFERENCES tipo_foto(id)
);

CREATE TABLE mesa (
    id SERIAL PRIMARY KEY,
    id_local INTEGER, -- fk de local
    nombre VARCHAR(30),
    capacidad SMALLINT,
    estado estado_mesa_enum,
    CONSTRAINT fk_mesa_local FOREIGN KEY (id_local) REFERENCES local(id) ON DELETE CASCADE
);

CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    id_local INTEGER, -- fk de local
    id_usuario INTEGER, -- fk de usuario
    fecha_reserva DATE,
    hora_reserva TIME,
    estado estado_reserva_enum,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    expirado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_reserva_local FOREIGN KEY (id_local) REFERENCES local(id),
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE TABLE reserva_mesa (
    id SERIAL PRIMARY KEY,
    id_reserva INTEGER, -- fk de reserva
    id_mesa INTEGER, -- fk de mesa
    prioridad SMALLINT, -- para ordenar mesas en caso de ser necesario
    CONSTRAINT fk_reservamesa_reserva FOREIGN KEY (id_reserva) REFERENCES reserva(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservamesa_mesa FOREIGN KEY (id_mesa) REFERENCES mesa(id)
);

CREATE TABLE pedido (
    id SERIAL PRIMARY KEY,
    id_local INTEGER, -- fk de local
    id_usuario INTEGER, -- fk de usuario
    id_mesa INTEGER, -- fk de mesa
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    estado estado_pedido_enum,
    total BIGINT,
    CONSTRAINT fk_pedido_local FOREIGN KEY (id_local) REFERENCES local(id),
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_pedido_mesa FOREIGN KEY (id_mesa) REFERENCES mesa(id)
);

CREATE TABLE estado_pedido (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER, -- fk de pedido
    creado_por INTEGER, -- fk de usuario, para saber quien cambio el estado
    estado estado_pedido_enum,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_estadopedido_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT fk_estadopedido_usuario FOREIGN KEY (creado_por) REFERENCES usuario(id)
);

CREATE TABLE qr_dinamico (
    id SERIAL PRIMARY KEY,
    id_mesa INTEGER, -- fk de mesa
    id_pedido INTEGER, -- fk de pedido
    codigo TEXT,
    expiracion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    activo BOOLEAN,
    CONSTRAINT fk_qrdinamico_mesa FOREIGN KEY (id_mesa) REFERENCES mesa(id),
    CONSTRAINT fk_qrdinamico_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id)
);

CREATE TABLE encomienda (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER, -- fk de pedido
    estado estado_encomienda_enum,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_encomienda_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id) ON DELETE CASCADE
);

CREATE TABLE cuenta (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER, -- fk de pedido
    id_producto INTEGER, -- fk de producto
    cantidad INTEGER,
    subtotal BIGINT,
    observaciones VARCHAR(500), -- notas adicionales
    CONSTRAINT fk_cuenta_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT fk_cuenta_producto FOREIGN KEY (id_producto) REFERENCES producto(id)
);

CREATE TABLE encomienda_cuenta (
    id SERIAL PRIMARY KEY,
    id_cuenta INTEGER, -- fk de cuenta
    id_encomienda INTEGER, -- fk de encomienda
    CONSTRAINT fk_encomienda_cuenta_cuenta FOREIGN KEY (id_cuenta) REFERENCES cuenta(id) ON DELETE CASCADE,
    CONSTRAINT fk_encomienda_cuenta_encomienda FOREIGN KEY (id_encomienda) REFERENCES encomienda(id) ON DELETE CASCADE
);

CREATE TABLE pago (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER, -- fk de pedido
    id_reserva INTEGER, -- fk de reserva
    metodo metodo_pago_enum,
    monto BIGINT,
    estado estado_pago_enum,
    registrado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT chk_pago_origen CHECK (id_pedido IS NOT NULL OR id_reserva IS NOT NULL),
    CONSTRAINT fk_pago_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id),
    CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES reserva(id)
);

CREATE TABLE opinion (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER, -- fk de usuario
    id_local INTEGER, -- fk de local
    puntuacion NUMERIC(2,1),
    comentario VARCHAR(500),
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    eliminado_el TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_opinion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_opinion_local FOREIGN KEY (id_local) REFERENCES local(id)
);

CREATE TABLE favorito (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER, -- fk de usuario
    id_local INTEGER, -- fk de local
    agregado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT unique_favorito UNIQUE (id_usuario, id_local),
    CONSTRAINT fk_favorito_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorito_local FOREIGN KEY (id_local) REFERENCES local(id) ON DELETE CASCADE
);