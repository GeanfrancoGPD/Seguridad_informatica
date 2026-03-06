import express from "express";
const router = express.Router();

import {
  appRegisterProducto,
  appGetProductos,
  appLogin,
  appUpdateProductoEstado,
  appRegisterQueja,
} from "../controllers/internalController.js";

router.get("/", (req, res) =>
  res.json({ message: "API interna - Acceso desde red Docker" }),
);
router.post("/registrar-producto", appRegisterProducto);
router.get("/productos", appGetProductos);
router.patch("/producto/:id/estado", appUpdateProductoEstado);
router.post("/queja", appRegisterQueja);
router.post("/login", appLogin);

export default router;
