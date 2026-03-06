import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import externalRoutes from "./router/externalRoutes.js";
import internalRoutes from "./router/internalRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Montar routers
app.use("/api", externalRoutes);
app.use("/app", internalRoutes);

// Health
app.get("/health", (req, res) => res.json({ status: "healthy" }));

// Optional DB check route (keeps compatibility con pruebas previas)
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: "envios_db",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al conectar a la base de datos" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Servidor escuchando en el puerto ${PORT}`),
);
