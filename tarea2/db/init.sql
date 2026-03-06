CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    direccion TEXT,
    telefono TEXT
);

CREATE TABLE IF NOT EXISTS envios (
    id SERIAL PRIMARY KEY,
    codigo_tracking TEXT UNIQUE,
    cliente_id INTEGER REFERENCES clientes(id),
    estado TEXT,
    origen TEXT,
    destino TEXT,
    fecha_envio TIMESTAMP,
    fecha_entrega TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historial_envio (
    id SERIAL PRIMARY KEY,
    envio_id INTEGER REFERENCES envios(id),
    estado TEXT,
    ubicacion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estados posibles para productos (catálogo)
CREATE TABLE IF NOT EXISTS estados_producto (
    id SMALLINT PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla de producto
CREATE TABLE IF NOT EXISTS producto (
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

-- Historial de cambios de estado de un producto
CREATE TABLE IF NOT EXISTS historial_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES producto(id) ON DELETE CASCADE,
    estado_id SMALLINT REFERENCES estados_producto(id),
    nota TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_productos_cliente ON producto(cliente_id);
CREATE INDEX IF NOT EXISTS idx_productos_envio ON producto(envio_id);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON producto(estado_id);

-- Datos iniciales recomendados para estados de producto
INSERT INTO estados_producto (id, nombre, descripcion)
VALUES
  (1, 'Pendiente', 'Producto registrado, pendiente de envío')
  ,(2, 'En tránsito', 'Producto en camino hacia destino')
  ,(3, 'Entregado', 'Producto entregado al destinatario')
  ,(4, 'Devuelto', 'Producto devuelto al remitente')
ON CONFLICT (id) DO NOTHING;

-- Ejemplo de inserción de un producto (descomentar para usarlo)
-- INSERT INTO producto (nombre, descripcion, sku, peso, valor, cliente_id, envio_id, estado_id)
-- VALUES ('Caja de libros', 'Caja con 3 libros de texto', 'SKU-001', 5.250, 45.00, 1, NULL, 1);
