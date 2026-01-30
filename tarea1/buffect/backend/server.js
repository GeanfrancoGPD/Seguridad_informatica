import app from "./utils/middleware.js";

const port = process.env.PORT || 3000;

// docker network create abogados_asociados --- Creo la red
// docker compose up --build --- creo el compose

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor ejecutandose en el puerto ${port}`);
});

app.post("/enviar", (req, res) => {
  res.status(200).send("Archivo recibo");
});
