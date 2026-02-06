-- Tabla de llaves (Token)
CREATE TABLE IF NOT EXISTS clave (
    publica TEXT PRIMARY KEY,
    privada TEXT NOT NULL
);

-- Tabla de almacén
CREATE TABLE IF NOT EXISTS almacen (
    id SERIAL PRIMARY KEY,
    pdf_documento BYTEA NOT NULL,
    hash_archivo TEXT NOT NULL,
    clave_publica_asociada TEXT NOT NULL,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_tribunal
        FOREIGN KEY (clave_publica_asociada)
        REFERENCES clave(publica)
        ON DELETE CASCADE
);
