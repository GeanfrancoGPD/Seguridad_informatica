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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
