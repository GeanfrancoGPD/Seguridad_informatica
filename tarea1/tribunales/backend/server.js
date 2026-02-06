import app from "./utils/middleware.js";
import Cifrado from "./utils/cifrados.js";
import db from "./utils/db.js";

const cifrador = new Cifrado();

// 1. GENERAR TOKEN (Clave Pública)
app.get("/code", async (req, res) => {
  console.log(
    "datos de la base de datos:",
    process.env.DB_USER,
    "",
    process.env.DB_HOST,
    process.env.DB_NAME,
    process.env.DB_PASSWORD,
    process.env.DB_PORT
  );
  try {
    const { publicKey, privateKey } = cifrador.GenerarClaveAsimetrica();

    await db.guardarClave(publicKey, privateKey);
    //console.log("Clave guardada en la base de datos", publicKey);

    res.send(publicKey);
  } catch (err) {
    res.status(500).send("Error al generar permiso. Errror: " + err.message);
  }
});

app.post("/recibir", async (req, res) => {
  const { pdf_cifrado, hash_bufete, clave_sim_enc, iv, publica_enviada } =
    req.body;

  if (
    !pdf_cifrado ||
    !hash_bufete ||
    !clave_sim_enc ||
    !iv ||
    !publica_enviada
  ) {
    return res.status(400).send("Faltan datos en la solicitud");
  }

  try {
    const resClave = await db.getClave(publica_enviada);
    console.log("respuesta de privada:", resClave);

    if (resClave.rows.length === 0)
      return res.status(401).send("Token no válido");

    const privadaTribunal = resClave.rows[0].privada;

    const claveSimetricaHex = cifrador.DescifrarAsimetrico(
      clave_sim_enc,
      privadaTribunal
    );
    const pdfPlano = cifrador.DescifrarSimetrico(
      Buffer.from(pdf_cifrado, "base64"),
      Buffer.from(claveSimetricaHex, "hex"),
      Buffer.from(iv, "hex")
    );

    const hashCalculado = cifrador.HashDatos(pdfPlano);

    // Validación de Integridad
    if (hashCalculado !== hash_bufete) {
      return res
        .status(400)
        .send("ERROR: Hashes diferentes, integridad comprometida");
    }

    // Guardado con Llave Foránea
    await db.setAlmacen(
      pdf_cifrado,
      clave_sim_enc,
      iv,
      hashCalculado,
      publica_enviada
    );

    res.status(200).send("Documento verificado y almacenado");
  } catch (error) {
    console.error("ERROR EN /recibir:", error);
    res.status(500).send(error.message);
  }
});

app.listen(3001, "0.0.0.0", () =>
  console.log("Tribunal activo en puerto 3001")
);

app.get("/datos", async (req, res) => {
  try {
    const mapa = await db.getAlmacen();
    const resultados = [];

    for (const [id, registro] of mapa.entries()) {
      resultados.push({
        id,
        hash_archivo: registro.hash,
        fecha_ingreso: registro.fecha,
        clave_publica_asociada: registro.publica,
      });
    }

    res.json(resultados);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener datos",
      error: error.message,
    });
  }
});

app.get("/datos", async (req, res) => {
  try {
    const mapa = await db.getAlmacen();
    const resultados = [];

    for (const [id, registro] of mapa.entries()) {
      resultados.push({
        id,
        hash_archivo: registro.hash,
        fecha_ingreso: registro.fecha,
        clave_publica_asociada: registro.publica,
      });
    }

    res.json(resultados);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener datos",
      error: error.message,
    });
  }
});

app.get("/datos", async (req, res) => {
  try {
    const mapa = await db.getAlmacen();
    const resultados = [];

    for (const [id, registro] of mapa.entries()) {
      resultados.push({
        id,
        hash_archivo: registro.hash,
        fecha_ingreso: registro.fecha,
        clave_publica_asociada: registro.publica,
      });
    }

    res.json(resultados);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener datos",
      error: error.message,
    });
  }
});

app.get("/almacen/:id/ver", async (req, res) => {
  try {
    const id = req.params.id;
    const mapa = await db.getAlmacen();
    const registro = mapa.get(Number(id));

    if (!registro) {
      return res.status(404).send("PDF no encontrado");
    }

    const { pdf_cifrado, clave_sim_enc, iv, privada } = registro;

    // Descifrado
    const claveSimHex = cifrador.DescifrarAsimetrico(clave_sim_enc, privada);
    const pdfPlano = cifrador.DescifrarSimetrico(
      Buffer.from(pdf_cifrado, "base64"),
      Buffer.from(claveSimHex, "hex"),
      Buffer.from(iv, "hex")
    );

    // Configurar headers para que el navegador lo muestre
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="documento_${id}.pdf"`
    );

    res.send(pdfPlano);
  } catch (error) {
    console.error("Error al ver PDF:", error);
    res.status(500).send("Error al mostrar PDF");
  }
});

app.get("/almacen/:id/descargar", async (req, res) => {
  try {
    const id = req.params.id;
    const mapa = await db.getAlmacen();
    const registro = mapa.get(Number(id));

    if (!registro) {
      return res.status(404).send("PDF no encontrado");
    }

    const { pdf_cifrado, clave_sim_enc, iv, privada } = registro;

    // Descifrado
    const claveSimHex = cifrador.DescifrarAsimetrico(clave_sim_enc, privada);
    const pdfPlano = cifrador.DescifrarSimetrico(
      Buffer.from(pdf_cifrado, "base64"),
      Buffer.from(claveSimHex, "hex"),
      Buffer.from(iv, "hex")
    );

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="documento_${id}.pdf"`
    );

    res.send(pdfPlano);
  } catch (error) {
    console.error("Error al descargar PDF:", error);
    res.status(500).send("Error al descargar PDF");
  }
});
