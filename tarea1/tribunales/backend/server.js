import appBase from "./utils/middleware.js"; // 
import pkg from 'pg';
const { Pool } = pkg;
import Cifrado from "./utils/cifrados.js"; // 

const app = appBase;
const cifrador = new Cifrado();
const pool = new Pool({
  user: 'juez_admin',
  host: 'tribunales_db',
  database: 'sistema_tribunal',
  password: 'tribunal_password',
  port: 5432,
});

app.get("/code", async (req, res) => {
  try {
    const result = await pool.query("SELECT publica FROM clave LIMIT 1");
    if (result.rows.length > 0) {
      res.send(result.rows[0].publica);
    } else {
      res.status(404).send("No hay claves generadas");
    }
  } catch (err) {
    res.status(500).send("Error al obtener clave del Tribunal");
  }
});

app.post("/recibir", async (req, res) => {
  const { pdf_cifrado, hash_bufete, clave_sim_enc, iv, publica_usada } = req.body;

  try {
    const resClave = await pool.query("SELECT privada FROM clave WHERE publica = $1", [publica_usada]);
    if (resClave.rows.length === 0) return res.status(401).send("Clave pública no válida");
    
    const privadaTribunal = resClave.rows[0].privada;

    const claveSimetricaHex = cifrador.descifrarAsimetrico(clave_sim_enc, privadaTribunal);

    const pdfBufferCifrado = Buffer.from(pdf_cifrado, 'base64');
    const pdfPlano = cifrador.descifrarSimetrico(
      pdfBufferCifrado,
      Buffer.from(claveSimetricaHex, 'hex'),
      Buffer.from(iv, 'hex')
    );

    const hashCalculado = cifrador.hashDatos(pdfPlano);
    if (hashCalculado !== hash_bufete) {
      return res.status(400).send("Error de integridad: los hashes no coinciden");
    }

    const queryInsert = "INSERT INTO almacen (pdf_documento, hash_archivo, clave_privada_archivo) VALUES ($1, $2, $3)";
    await pool.query(queryInsert, [pdfPlano, hashCalculado, privadaTribunal]);

    res.status(200).send("Documento recibido, descifrado y verificado correctamente");

  } catch (error) {
    console.error("Error en proceso de tribunal:", error);
    res.status(500).send("Error interno al procesar el documento");
  }
});

// API para que el frontend de tribunales liste los archivos
app.get("/listado", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, hash_archivo, encode(pdf_documento, 'base64') as pdf FROM almacen"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error al consultar almacén");
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log("Servidor del Tribunal activo en puerto 3001");
});