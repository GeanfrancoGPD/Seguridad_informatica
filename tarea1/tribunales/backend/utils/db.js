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

  async setAlmacen(pdfPlano, hashCalculado, publica_enviada) {
    try {
      await pool.query(
        "INSERT INTO almacen (pdf_documento, hash_archivo, clave_publica_asociada) VALUES ($1, $2, $3)",
        [pdfPlano, hashCalculado, publica_enviada]
      );
    } catch (error) {
      console.error("Error al guardar en almacen:", error);
    }
  }

  async getAlmacen() {
    try {
      const res = await pool.query("SELECT * FROM almacen");
      return res.rows;
    } catch (error) {
      console.error("Error al obtener almacen:", error);
      return [];
    }
  }
}

export default new DB();
