import crypto from "crypto";
import fs from "fs";

export default class Cifrado {
  constructor() {}

  CifrarSimetrico(datos) {
    const clave = this.GenerarClaveSimetrica();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", clave, iv);

    const encrypted = Buffer.concat([cipher.update(datos), cipher.final()]);
    // fs.writeFileSync("archivo.pdf.enc", encrypted); // Guardar el archivo cifrado si es necesario
    return {
      iv: iv,
      encryptedData: encrypted,
      clave: clave,
    };
  }

  DescifrarSimetrico(encryptedData, clave, iv) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", clave, iv);

    let decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    //fs.writeFileSync("archivo_descifrado.pdf", decrypted); // Guardar el archivo descifrado

    return decrypted;
  }

  GenerarClaveSimetrica() {
    return crypto.randomBytes(32); // 256 bits para AES-256
  }

  HashDatos(datos) {
    return crypto.createHash("sha256").update(datos).digest("hex");
  }

  CifradoAsimetrico(datos, publicKey) {
    const buffer = Buffer.from(datos, "utf8");
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    );
    return encrypted.toString("hex");
  }

  DescifrarAsimetrico(encryptedData, privateKey) {
    const buffer = Buffer.from(encryptedData, "hex");
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    );
    return decrypted.toString("utf8");
  }

  GenerarClaveAsimetrica() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });
    return {
      publicKey: publicKey.export({ type: "spki", format: "pem" }),
      privateKey: privateKey.export({ type: "pkcs8", format: "pem" }),
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
