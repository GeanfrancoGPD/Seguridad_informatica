-- =========================
-- EMPLEADOS
-- =========================
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL DEFAULT 'operador',
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    direccion TEXT,
    telefono TEXT,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ENVIOS
-- =========================
CREATE TABLE IF NOT EXISTS envios (
    id SERIAL PRIMARY KEY,
    codigo_tracking TEXT UNIQUE NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    estado TEXT DEFAULT 'creado',
    origen TEXT,
    destino TEXT,
    fecha_envio TIMESTAMP,
    fecha_entrega TIMESTAMP,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- HISTORIAL ENVIO
-- =========================
CREATE TABLE IF NOT EXISTS historial_envio (
    id SERIAL PRIMARY KEY,
    envio_id INTEGER NOT NULL REFERENCES envios(id) ON DELETE CASCADE,
    estado TEXT NOT NULL,
    ubicacion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ESTADOS PRODUCTO (CATALOGO)
-- =========================
CREATE TABLE IF NOT EXISTS estados_producto (
    id SMALLINT PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT
);

-- =========================
-- PRODUCTOS
-- =========================
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,

    nombre TEXT NOT NULL,
    descripcion TEXT,

    sku TEXT UNIQUE,

    peso NUMERIC(10,3) CHECK (peso >= 0),
    valor NUMERIC(12,2) DEFAULT 0,

    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    envio_id INTEGER REFERENCES envios(id) ON DELETE SET NULL,

    estado_id SMALLINT REFERENCES estados_producto(id) DEFAULT 1,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- HISTORIAL PRODUCTO
-- =========================
CREATE TABLE IF NOT EXISTS historial_producto (
    id SERIAL PRIMARY KEY,

    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,

    estado_id SMALLINT REFERENCES estados_producto(id),

    nota TEXT,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDICES
-- =========================
CREATE INDEX IF NOT EXISTS idx_productos_cliente
ON productos(cliente_id);

CREATE INDEX IF NOT EXISTS idx_productos_envio
ON productos(envio_id);

CREATE INDEX IF NOT EXISTS idx_productos_estado
ON productos(estado_id);

CREATE INDEX IF NOT EXISTS idx_envios_cliente
ON envios(cliente_id);

CREATE INDEX IF NOT EXISTS idx_historial_producto
ON historial_producto(producto_id);

CREATE INDEX IF NOT EXISTS idx_historial_envio
ON historial_envio(envio_id);

-- =========================
-- ESTADOS INICIALES
-- =========================
INSERT INTO estados_producto (id, nombre, descripcion)
VALUES
 (1,'Pendiente','Producto registrado, pendiente de envío'),
 (2,'En tránsito','Producto en transporte'),
 (3,'Entregado','Producto entregado al destinatario'),
 (4,'Devuelto','Producto devuelto al remitente')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- QUEJAS / RECLAMOS (Atención al cliente)
-- =========================
CREATE TABLE IF NOT EXISTS quejas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    estado TEXT DEFAULT 'abierta', -- abierta, en_proceso, cerrada
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quejas_cliente ON quejas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_quejas_producto ON quejas(producto_id);
