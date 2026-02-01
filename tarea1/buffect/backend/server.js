import app from "./utils/middleware.js";
import validatePDF from "./utils/validateData.js";

const port = process.env.PORT || 3000;

// docker network create abogados_asociados --- Creo la red
// docker compose up --build --- creo el compose

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor ejecutandose en el puerto ${port}`);
});

app.post("/enviar", (req, res) => {
  fetch("http://buffect_tribunal:3001/code", {
    method: "GET",
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("Respuesta del tribunal:", data);
    });

  if (data === null || data === undefined) {
    res.status(400).send("Error al recibir confirmacion del tribunal");
  }

  if (req.body === null || req.body === undefined) {
    res.status(400).send("Error al recibir datos del cliente");
  }

  if (!validatePDF(req.body.data)) {
    res.status(400).send("El archivo no es un PDF valido");
  }
});
