import http from 'http';

// Configuración para conectar al backend expuesto en el puerto 3000 (según compose)
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/test-db-data',
  method: 'GET',
};

console.log("Iniciando prueba de integración con la base de datos...");

const req = http.request(options, (res) => {
  console.log(`ESTADO RESPUESTA: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`CUERPO RESPUESTA: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problema con la petición: ${e.message}\nAsegúrate de que los contenedores estén corriendo (docker-compose up).`);
});

req.end();