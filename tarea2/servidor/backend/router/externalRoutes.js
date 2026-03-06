import express from "express";
const router = express.Router();

import {
  apiRegisterProducto,
  apiGetProductos,
  apiLogin,
  apiUpdateProductoEstado,
  apiRegisterQueja,
} from "../controllers/externalController.js";

router.get("/", (req, res) =>
  res.json({ message: "API pública - Acceso desde internet" }),
);
router.get("/saludar", (req, res) =>
  res.json({ mensaje: "¡Hola desde el servidor Express!" }),
);
router.post("/registrar-producto", apiRegisterProducto);
router.get("/productos", apiGetProductos);
router.patch("/producto/:id/estado", apiUpdateProductoEstado);
router.post("/queja", apiRegisterQueja);
router.post("/login", apiLogin);

export default router;
