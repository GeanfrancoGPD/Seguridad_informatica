import app from "./utils/middleware.js";
import Cifrado from "./utils/cifrados.js";
import db from "./utils/db.js";

const cifrador = new Cifrado();

// 1. GENERAR TOKEN (Clave Pública)
app.get("/code", async (req, res) => {
  try {
    const { publicKey, privateKey } = cifrador.GenerarClaveAsimetrica();

    await db.guardarClave(publicKey, privateKey);
    console.log("Clave guardada en la base de datos", publicKey);

    res.send(publicKey);
  } catch (err) {
    res.status(500).send("Error al generar permiso. Errror: " + err.message);
  }
});

// 2. RECIBIR Y VALIDAR
app.post("/recibir", async (req, res) => {
  const { pdf_cifrado, hash_bufete, clave_sim_enc, iv, publica_enviada } =
    req.body;

  try {
    const resClave = await pool.query(
      "SELECT privada FROM clave WHERE publica = $1",
      [publica_enviada]
    );
    if (resClave.rows.length === 0)
      return res.status(401).send("Token no válido");

    const privadaTribunal = resClave.rows[0].privada;

    const claveSimetricaHex = cifrador.descifrarAsimetrico(
      clave_sim_enc,
      privadaTribunal
    );
    const pdfPlano = cifrador.descifrarSimetrico(
      Buffer.from(pdf_cifrado, "base64"),
      Buffer.from(claveSimetricaHex, "hex"),
      Buffer.from(iv, "hex")
    );

    const hashCalculado = cifrador.hashDatos(pdfPlano);

    // Validación de Integridad
    if (hashCalculado !== hash_bufete) {
      return res
        .status(400)
        .send("ERROR: Hashes diferentes, integridad comprometida");
    }

    // Guardado con Llave Foránea
    await pool.query(
      "INSERT INTO almacen (pdf_documento, hash_archivo, clave_publica_asociada) VALUES ($1, $2, $3)",
      [pdfPlano, hashCalculado, publica_enviada]
    );

    res.status(200).send("Documento verificado y almacenado");
  } catch (error) {
    res.status(500).send("Error interno de procesamiento");
  }
});

app.listen(3001, "0.0.0.0", () =>
  console.log("Tribunal activo en puerto 3001")
);
