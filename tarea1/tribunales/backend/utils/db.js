import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

// Equivalente real de __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta ABSOLUTA al init.sql
const INIT_SQL_PATH = path.join(__dirname, "../database/init.sql");

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

class DB {
  constructor() {
    this.pool = pool;
    this.cargarDB();
    this.probarConexion();
  }

  async probarConexion() {
    try {
      const client = await pool.connect();
      console.log("Conexión a la base de datos exitosa");
      client.release();
    } catch (error) {
      console.error("Error al conectar a la base de datos:", error);
    }
  }

  async guardarClave(publica, privada) {
    await pool.query("INSERT INTO clave (publica, privada) VALUES ($1, $2)", [
      publica,
      privada,
    ]);
  }

  async cargarDB() {
    try {
      console.log("Ruta SQL:", INIT_SQL_PATH);

      const db = fs.readFileSync(INIT_SQL_PATH, "utf8");
      await pool.query(db);

      console.log("Base de datos inicializada correctamente");
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error);
    }
  }

  async getDatos() {
    try {
      const res = await pool.query("SELECT * FROM clave");
      return res.rows;
    } catch (error) {
      console.error("Error al obtener datos de la base de datos:", error);
      return [];
    }
  }

  async getClave(publica) {
    try {
      const res = await pool.query(
        "SELECT privada FROM clave WHERE publica = $1",
        [publica]
      );
      return res;
    } catch (error) {
      console.error("Error al obtener clave privada:", error);
      return null;
    }
  }

  async setAlmacen(pdf_cifrado, clave_sim_enc, iv, hash, publica) {
    await pool.query(
      `INSERT INTO almacen 
      (pdf_documento, hash_archivo, clave_sim_enc, iv, clave_publica_asociada)
      VALUES ($1, $2, $3, $4, $5)`,
      [Buffer.from(pdf_cifrado, "base64"), hash, clave_sim_enc, iv, publica]
    );
  }

  async getAlmacen() {
    try {
      const query = `
      SELECT 
        a.id,
        a.pdf_documento,
        a.hash_archivo,
        a.clave_sim_enc,
        a.iv,
        a.fecha_ingreso,
        c.privada
      FROM almacen a
      INNER JOIN clave c
        ON a.clave_publica_asociada = c.publica
    `;

      const res = await pool.query(query);

      const mapa = new Map();

      res.rows.forEach((row) => {
        mapa.set(row.id, {
          privada: row.privada,
          pdf_cifrado: row.pdf_documento,
          clave_sim_enc: row.clave_sim_enc,
          iv: row.iv,
          hash: row.hash_archivo,
          fecha: row.fecha_ingreso,
        });
      });

      return mapa;
    } catch (error) {
      console.error("Error al obtener almacen con join:", error);
      return new Map();
    }
  }
}

export default new DB();
