import express from "express";
const router = express.Router();

import {
  appRegisterProducto,
  appGetProductos,
  appLogin,
} from "../controllers/internalController.js";

router.get("/", (req, res) =>
  res.json({ message: "API interna - Acceso desde red Docker" }),
);
router.post("/registrar-producto", appRegisterProducto);
router.get("/productos", appGetProductos);
router.post("/login", appLogin);

export default router;
