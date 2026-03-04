import express from "express";
import dotenv from "dotenv";
import ldap from "ldapjs";
dotenv.config();

export default function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = process.env.PORT || 5000;

  app.get("/", (req, res) => {
    res.send("Servidor Express funcionando");
  });

  app.get("/saludar", (req, res) => {
    res.json({ mensaje: "¡Hola desde el servidor Express!" });
  });

  app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const client = ldap.createClient({
      url: process.env.LDAP_URL,
    });

    const dn = `uid=${username},ou=employees,dc=envios,dc=local`;

    client.bind(dn, password, (err) => {
      if (err) {
        console.error("Error de autenticación LDAP:", err);
        res.status(401).json({ error: "Credenciales inválidas" });
      } else {
        res.json({ message: "Autenticación exitosa" });
      }
      client.unbind();
    });
  });

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

startServer();
