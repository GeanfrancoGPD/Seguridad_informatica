import pkg from "pg";
import fs from "fs";
import path from "path";

const { Pool } = pkg;

// Configuración mediante Variables de Entorno
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
      const client = await pool.connect(); //intenta conectarse
      console.log(" Conexión a la base de datos exitosa");
      client.release(); // libera el cliente al pool
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
    console.log("url :", process.env.URL_DB);

    const __dirname = path.dirname(
      new URL(`"` + process.env.URL_DB + `"`).pathname
    );

    console.log("ruta absoluta:", __dirname);

    let db = fs.readFileSync(path.join(__dirname), "utf8");
    console.log("db:", db);

    try {
      await pool.query(db);
      console.log("Base de datos inicializada correctamente");
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error);
    }
  }
}

export default new DB();
