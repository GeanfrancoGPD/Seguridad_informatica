import express from "express";
import cors from "cors";

const app = express();

// --- CORS global ---
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// JSON
app.use(express.json({ limit: "50mb" }));

// Formularios grandes

app.use(express.urlencoded({ limit: "50mb", extended: true }));
export default app;
