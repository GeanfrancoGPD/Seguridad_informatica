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
app.use(express.json());

export default app;
