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

export async function appRegisterProducto(req, res) {
  try {
    const {
      producto,
      descripcion,
      sku,
      peso,
      valor,
      cliente,
      cliente_id,
      envio_id,
      estado_id,
      fecha,
    } = req.body;

    if (!producto || (!cliente && !cliente_id) || !peso) {
      return res.status(400).json({
        error:
          "Faltan campos obligatorios: producto, cliente (o cliente_id), peso",
      });
    }

    let clientId = cliente_id || null;
    if (!clientId && cliente) {
      const maybeNum = Number(cliente);
      if (!Number.isNaN(maybeNum) && Number.isInteger(maybeNum)) {
        clientId = maybeNum;
      } else {
        const r = await pool.query(
          "SELECT id FROM clientes WHERE nombre = $1 LIMIT 1",
          [cliente],
        );
        if (r.rowCount > 0) clientId = r.rows[0].id;
        else {
          const ins = await pool.query(
            "INSERT INTO clientes (nombre) VALUES ($1) RETURNING id",
            [cliente],
          );
          clientId = ins.rows[0].id;
        }
      }
    }

    const query = `INSERT INTO productos (nombre, descripcion, sku, peso, valor, cliente_id, envio_id, estado_id, fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
    const values = [
      producto,
      descripcion || null,
      sku || null,
      peso,
      valor || 0,
      clientId,
      envio_id || null,
      estado_id || 1,
      fecha || new Date(),
    ];

    const result = await pool.query(query, values);

    try {
      await pool.query(
        "INSERT INTO historial_producto (producto_id, estado_id, nota) VALUES ($1, $2, $3)",
        [result.rows[0].id, values[7], "Registro inicial"],
      );
    } catch (e) {
      console.warn("No se pudo insertar historial_producto:", e.message);
    }

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

export async function appGetProductos(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, c.nombre AS cliente_nombre, e.nombre AS estado_nombre
       FROM productos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN estados_producto e ON p.estado_id = e.id
       ORDER BY p.id DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res
      .status(500)
      .json({ error: "Error al obtener productos de la base de datos" });
  }
}

export function appLogin(req, res) {
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

export async function appUpdateProductoEstado(req, res) {
  try {
    const id = Number(req.params.id);
    const { estado_id, nota } = req.body;
    if (!id || !estado_id)
      return res.status(400).json({ error: "Faltan id o estado_id" });

    const r = await pool.query(
      "UPDATE productos SET estado_id = $1 WHERE id = $2 RETURNING *",
      [estado_id, id],
    );
    if (r.rowCount === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    await pool.query(
      "INSERT INTO historial_producto (producto_id, estado_id, nota) VALUES ($1,$2,$3)",
      [id, estado_id, nota || "Cambio de estado por operador"],
    );

    res.json({ message: "Estado actualizado", data: r.rows[0] });
  } catch (err) {
    console.error("Error actualizando estado:", err);
    res.status(500).json({ error: "Error interno al actualizar estado" });
  }
}

export async function appRegisterQueja(req, res) {
  try {
    const { cliente_id, producto_id, descripcion } = req.body;
    if (!descripcion)
      return res.status(400).json({ error: "Falta descripcion" });

    const result = await pool.query(
      "INSERT INTO quejas (cliente_id, producto_id, descripcion) VALUES ($1,$2,$3) RETURNING *",
      [cliente_id || null, producto_id || null, descripcion],
    );
    res.status(201).json({ message: "Queja registrada", data: result.rows[0] });
  } catch (err) {
    console.error("Error registrando queja:", err);
    res.status(500).json({ error: "Error interno al registrar queja" });
  }
}

export async function appGetQuejas(req, res) {
  try {
    const result = await pool.query(
      "SELECT q.*, c.nombre AS cliente_nombre, p.nombre AS producto_nombre FROM quejas q LEFT JOIN clientes c ON q.cliente_id = c.id LEFT JOIN productos p ON q.producto_id = p.id ORDER BY q.id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo quejas:", err);
    res.status(500).json({ error: "Error interno al obtener quejas" });
  }
}
