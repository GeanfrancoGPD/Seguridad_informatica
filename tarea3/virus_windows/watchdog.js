import chokidar from "chokidar";
import path from "path";
import { spawn } from "child_process";
import psList from "ps-list";

// Paso 1. Definimos a que carpeta vamos a vigilar o directorio
let watch_carpeta = "./prueba";

console.log(`--- Watchdog activo en: ${path.resolve(watch_carpeta)} ---`);

const watcher = chokidar.watch(watch_carpeta, {
  ignored: /(^|[\/\\])\../, // Ignorar archivos ocultos
  persistent: true,
  ignoreInitial: true, // No avisar por los archivos que ya existen al arrancar
  depth: 99, // Monitorear subcarpetas
});

watcher
  .on("add", (path) =>
    console.log(`[NUEVO] El archivo ${path} ha sido creado.`),
  )
  .on("change", (path) =>
    console.log(`[CAMBIO] El archivo ${path} ha sido modificado.`),
  )
  .on("unlink", (path) =>
    console.log(`[BORRADO] El archivo ${path} ha sido eliminado.`),
  )
  .on("error", (error) =>
    console.log(`[ERROR] Error en el Watchdog: ${error}`),
  );

// Evento especial para carpetas
watcher.on("addDir", (path) =>
  console.log(`[CARPETA] Nueva carpeta creada: ${path}`),
);

async function estaCorriendo(nombre) {
  const procesos = await psList();
  return procesos.some((p) =>
    p.name.toLowerCase().includes(nombre.toLowerCase()),
  );
}

async function verificarYLevantar() {
  const activo = await estaCorriendo("spam");

  if (!activo) {
    console.log("[RECOVERY] Proceso spam no encontrado. Iniciando...");

    spawn("node", ["spam.js"], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } else {
    console.log("[OK] Proceso spam activo");
  }
}

setInterval(verificarYLevantar, 5000);
