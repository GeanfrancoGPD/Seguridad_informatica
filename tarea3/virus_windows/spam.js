import notify from "node-notifier";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { spawn } from "child_process";
import psList from "ps-list";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let imagenRuta = join(__dirname, "./asset/image.png");

function enviarNotificacionSpam() {
  notify.notify(
    {
      title: "Oferta Especial",
      message:
        "Debido a que eres el usuario más valioso te ofrecemos una ¡Nueva PC GAMER por tan solo 199.99 USD!",
      icon: imagenRuta,
      sound: true,
      appName: "TecnoStore",
      wait: true,
    },
    (err, response, metadata) => {
      console.log("Notificación de spam enviada.");
    },
  );
}

setInterval(enviarNotificacionSpam, 5000);

console.log("Simulador de spam iniciado...");

// async function estaCorriendo(nombre) {
//   const procesos = await psList();
//   return procesos.some((p) =>
//     p.name.toLowerCase().includes(nombre.toLowerCase()),
//   );
// }

// async function verificarYLevantar() {
//   const activo = await estaCorriendo("watchdog");

//   if (!activo) {
//     console.log("[RECOVERY] Proceso watchdog no encontrado. Iniciando...");

//     spawn("node", ["watchdog.js"], {
//       detached: true,
//       stdio: "ignore",
//     }).unref();
//   } else {
//     console.log("[OK] Proceso watchdog activo");
//   }
// }

// setInterval(verificarYLevantar, 5000);
