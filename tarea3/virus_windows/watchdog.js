import chokidar from "chokidar";
import path from "path";
import fs from "fs/promises";

const watchCarpeta = "./prueba";

console.log(`--- Watchdog activo en: ${path.resolve(watchCarpeta)} ---`);

const watcher = chokidar.watch(watchCarpeta, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
  depth: 99,
});

async function procesarArchivo(filePath) {
  try {
    const nombreArchivo = path.basename(filePath);
    const nombreCarpeta = path.basename(path.dirname(filePath));

    const contenido = await fs.readFile(filePath, "utf-8");

    const data = {
      nombreCarpeta,
      nombreArchivo,
      contenido,
    };

    console.log(`[DATA] ${JSON.stringify(data)}`);

    const res = await fetch("http://localhost:3000/attach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const result = await res.text();
    console.log("[SERVER]", result);
  } catch (error) {
    console.error(`[ERROR] procesando ${filePath}:`, error.message);
  }
}

// Eventos
watcher
  .on("add", (filePath) => {
    console.log(`[NUEVO] ${filePath}`);
    procesarArchivo(filePath);
  })
  .on("change", (filePath) => {
    console.log(`[CAMBIO] ${filePath}`);
    procesarArchivo(filePath);
  })
  .on("unlink", (filePath) => {
    console.log(`[BORRADO] ${filePath}`);
  })
  .on("addDir", (dirPath) => {
    console.log(`[CARPETA] ${dirPath}`);
  })
  .on("error", (error) => {
    console.error(`[WATCHER ERROR]`, error);
  });

// async function estaCorriendo(nombre) {
//   const procesos = await psList();
//   return procesos.some((p) =>
//     p.name.toLowerCase().includes(nombre.toLowerCase()),
//   );
// }

// async function verificarYLevantar() {
//   const activo = await estaCorriendo("spam");

//   if (!activo) {
//     console.log("[RECOVERY] Proceso spam no encontrado. Iniciando...");

//     spawn("node", ["spam.js"], {
//       detached: true,
//       stdio: "ignore",
//     }).unref();
//   } else {
//     console.log("[OK] Proceso spam activo");
//   }
// }

// setInterval(verificarYLevantar, 5000);
