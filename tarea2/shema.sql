CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    direccion TEXT,
    telefono TEXT
);

CREATE TABLE envios (
    id SERIAL PRIMARY KEY,
    codigo_tracking TEXT UNIQUE,
    cliente_id INTEGER REFERENCES clientes(id),
    estado TEXT,
    origen TEXT,
    destino TEXT,
    fecha_envio TIMESTAMP,
    fecha_entrega TIMESTAMP
);

CREATE TABLE historial_envio (
    id SERIAL PRIMARY KEY,
    envio_id INTEGER REFERENCES envios(id),
    estado TEXT,
    ubicacion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);