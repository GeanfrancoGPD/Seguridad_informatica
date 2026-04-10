import { exec } from "child_process";

// Para matar los procesos de spam y watchdog, simplemente ejecutamos un comando que los elimine por su nombre. En Windows, podemos usar wmic para esto.

const procesos = ["spam.js", "watchdog.js"];

procesos.forEach((p) => {
  exec(`wmic process where "CommandLine like '%${p}%'" delete`, (err) => {
    if (err) {
      console.log(`[ERROR] No se pudo detener ${p}`);
    } else {
      console.log(`[KILL] ${p} detenido`);
    }
  });
});
