CREATE TABLE clave (
    publica TEXT PRIMARY KEY,
    privada TEXT NOT NULL
);

CREATE TABLE almacen (
    id SERIAL PRIMARY KEY,
    pdf_documento BYTEA,           
    hash_registrado VARCHAR(64),   
    clave_privada_archivo TEXT,    
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);