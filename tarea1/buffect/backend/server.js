import app from "./utils/middleware.js";
import Cifrado from "./utils/Cifrados.js";
import multer from "multer";

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Solo se permiten PDFs"));
    } else {
      cb(null, true);
    }
  },
});

const port = process.env.PORT || 3000;

// docker network create abogados_asociados --- Creo la red
// docker compose up --build --- creo el compose

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor ejecutandose en el puerto ${port}`);
});
console.log("url del servidor de back:", process.env.TRIBUNAL_URL);

app.post("/enviar", upload.single("data"), async (req, res) => {
  try {
    // 1. Pedir clave pública al tribunal
    const response = await fetch(process.env.TRIBUNAL_URL + "/code");
    const llave_publica = await response.text();

    if (!llave_publica) {
      return res.status(400).send("Error al recibir confirmación del tribunal");
    }

    if (!req.file) {
      return res.status(400).send("Error al recibir datos del cliente");
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).send("El archivo no es un PDF válido");
    }

    // 3. Procesar PDF
    const pdfData = req.file.buffer;
    const cifrados = new Cifrado();

    // Hash
    const hashPDF = cifrados.HashDatos(pdfData);

    // Cifrado simétrico
    const cifradoSimetrico = cifrados.CifrarSimetrico(pdfData);

    // Cifrado asimétrico (con la CLAVE PÚBLICA)
    console.log("llave publica:", llave_publica);

    const claveSimetricaCifrada = cifrados.CifradoAsimetrico(
      cifradoSimetrico.clave.toString("hex"),
      llave_publica
    );

    // 4. Responder
    res.status(200).json({
      mensaje: "Archivo procesado correctamente",
      hash_bufete: hashPDF,
      pdf_cifrado: cifradoSimetrico.encryptedData.toString("base64"),
      iv: cifradoSimetrico.iv.toString("hex"),
      clave_sim_enc: claveSimetricaCifrada,
      publica_enviada: llave_publica,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno en el bufete");
  }
});
