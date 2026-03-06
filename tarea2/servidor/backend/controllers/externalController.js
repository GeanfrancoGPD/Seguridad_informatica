import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || "enviosAdmin",
  host: process.env.POSTGRES_HOST || "envios_db",
  database: process.env.POSTGRES_DB || "sistema_envios",
  password: process.env.POSTGRES_PASSWORD || "express123",
  port: 5432,
});

export async function apiRegisterProducto(req, res) {
  try {
    const { producto, cliente, peso, fecha } = req.body;
    if (!producto || !cliente || !peso) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios: producto, cliente, peso" });
    }
    const query =
      "INSERT INTO producto (nombre, cliente, peso, fecha) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [producto, cliente, peso, fecha || new Date()];
    const result = await pool.query(query, values);
    res.status(201).json({
      message: "Producto registrado exitosamente",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error al registrar producto:", err);
    res
      .status(500)
      .json({ error: "Error al registrar producto en la base de datos" });
  }
}

export async function apiGetProductos(req, res) {
  try {
    const result = await pool.query("SELECT * FROM producto");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res
      .status(500)
      .json({ error: "Error al obtener productos de la base de datos" });
  }
}

export function apiLogin(req, res) {
  import("ldapjs")
    .then((ldap) => {
      const { username, password } = req.body;
      const client = ldap.createClient({ url: process.env.LDAP_URL });
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
          searchRes.on("searchEntry", (entry) => groups.push(entry.object.cn));
          searchRes.on("end", () => {
            res.json({ message: "Autenticación exitosa", groups });
            client.unbind();
          });
        });
      });
    })
    .catch((err) => {
      console.error("Error cargando ldapjs:", err);
      res.status(500).json({ error: "Error interno" });
    });
}
