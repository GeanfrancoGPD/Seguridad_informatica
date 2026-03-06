import express from "express";
const router = express.Router();

import {
  apiRegisterProducto,
  apiGetProductos,
  apiLogin,
} from "../controllers/externalController.js";

router.get("/", (req, res) =>
  res.json({ message: "API pública - Acceso desde internet" }),
);
router.post("/registrar-producto", apiRegisterProducto);
router.get("/productos", apiGetProductos);
router.post("/login", apiLogin);

export default router;
