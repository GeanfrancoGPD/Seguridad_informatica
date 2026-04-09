import express from "express";
const router = express.Router();

import {
  appRegisterProducto,
  appGetProductos,
  appLogin,
  appUpdateProductoEstado,
  appRegisterQueja,
  appGetQuejas,
} from "../controllers/internalController.js";

router.get("/", (req, res) =>
  res.json({ message: "API interna - Acceso desde red Docker" }),
);
router.post("/registrar-producto", appRegisterProducto);
router.get("/productos", appGetProductos);
router.patch("/producto/:id/estado", appUpdateProductoEstado);
router.post("/queja", appRegisterQueja);
router.get("/quejas", appGetQuejas);
router.post("/login", appLogin);

export default router;
