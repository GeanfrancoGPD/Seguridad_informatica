import express from "express";
import dotenv from "dotenv";
import ldap from "ldapjs";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: "envios_db",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

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

  app.get("/db", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al conectar a la base de datos" });
    }
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
        client.unbind();
        return;
      }

      const opts = {
        filter: `(memberUid=${username})`,
        scope: "sub",
        attributes: ["cn"],
      };

      client.search("ou=roles,dc=envios,dc=local", opts, (err, searchRes) => {
        if (err) {
          console.error("Error al buscar grupos:", err);
          res.status(500).json({ error: "Error al buscar grupos" });
          client.unbind();
          return;
        }

        const groups = [];
        searchRes.on("searchEntry", (entry) => {
          groups.push(entry.object.cn);
        });

        searchRes.on("end", () => {
          res.json({ message: "Autenticación exitosa", groups });
          client.unbind();
        });
      });
    });
  });

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

startServer();
