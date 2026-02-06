-- 1. Tabla de llaves (El Token)
CREATE TABLE clave (
    publica TEXT PRIMARY KEY,
    privada TEXT NOT NULL
);

-- 2. Tabla de almacén con Relación de Integridad
CREATE TABLE almacen (
    id SERIAL PRIMARY KEY,
    pdf_documento BYTEA NOT NULL,
    hash_archivo TEXT NOT NULL,
    clave_publica_asociada TEXT NOT NULL, -- LLAVE FORÁNEA
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_token_tribunal
        FOREIGN KEY (clave_publica_asociada) 
        REFERENCES clave(publica)
        ON DELETE CASCADE
);