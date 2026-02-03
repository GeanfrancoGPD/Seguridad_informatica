import crypto from "crypto";
import fs from "fs";

export default class Cifrado {
  constructor() {}

  cifrarSimetrico(datos) {
    const clave = this.generarClaveSimetrica();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", clave, iv);
    const pdfBuffer = fs.readFileSync(datos);

    const encrypted = Buffer.concat([cipher.update(pdfBuffer), cipher.final()]);
    // fs.writeFileSync("archivo.pdf.enc", encrypted); // Guardar el archivo cifrado si es necesario
    return {
      iv: iv,
      encryptedData: encrypted,
      clave: clave,
    };
  }

  descifrarSimetrico(encryptedData, clave, iv) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", clave, iv);

    let decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    //fs.writeFileSync("archivo_descifrado.pdf", decrypted); // Guardar el archivo descifrado

    return decrypted;
  }

  generarClaveSimetrica() {
    return crypto.randomBytes(32); // 256 bits para AES-256
  }

  hashDatos(datos) {
    return crypto.createHash("sha256").update(datos).digest("hex");
  }

  cifradoAsimetrico(datos, publicKey) {
    const buffer = Buffer.from(datos, "utf8");
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("hex");
  }

  descifrarAsimetrico(encryptedData, privateKey) {
    const buffer = Buffer.from(encryptedData, "hex");
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString("utf8");
  }

  generarClaveAsimetrica() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });
    return {
      publicKey: publicKey.export({ type: "pkcs1", format: "pem" }),
      privateKey: privateKey.export({ type: "pkcs1", format: "pem" }),
    };
  }
}

/* Se Logro muchachos se logrooooooo

// Ejemplo de uso
console.log("hash del pdf");
let cifrados = new Cifrado();
let hash = cifrados.hashDatos(fs.readFileSync("si.pdf"));
console.log("Hash del PDF:", hash);

console.log("Cifrado y Descifrado Simetrico:");
let s = cifrados.cifrarSimetrico("si.pdf");
console.log("Cifrado:", s);
let pdfDescifrado = cifrados.descifrarSimetrico(s.encryptedData, s.clave, s.iv);
console.log("Decifrado:", pdfDescifrado.toString("utf8").slice(0, 100) + "...");
console.log("Ahora con el cifrado Asimetrico:");
let clavesAsimetricas = cifrados.generarClaveAsimetrica();
console.log("Claves Asimetricas:", clavesAsimetricas);
let cifradoAsimetrico = cifrados.cifradoAsimetrico(
  s.clave.toString("utf8"),
  clavesAsimetricas.publicKey
);
console.log("Cifrado Asimetrico:", cifradoAsimetrico);
let descifradoAsimetrico = cifrados.descifrarAsimetrico(
  cifradoAsimetrico,
  clavesAsimetricas.privateKey
);

console.log("Descifrado Asimetrico:", descifradoAsimetrico);

const hashFinal = cifrados.hashDatos(pdfDescifrado);

console.log("¿Archivo íntegro?", hashFinal === hash);

*/
