import crypto from "crypto";

class Cifrado {
  constructor() {}

  cifrarSimetrico(datos) {
    const clave = this.generarClaveSimetrica();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", clave, iv);
    let encrypted = cipher.update(datos, "utf8", "hex");
    encrypted += cipher.final("hex");
    return {
      iv: iv.toString("hex"),
      encryptedData: encrypted,
      clave: clave.toString("hex"),
    };
  }

  descifrarSimetrico(encryptedData, clave, iv) {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(clave, "hex"),
      Buffer.from(iv, "hex")
    );

    let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
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
}

let mensaje = "Hola, este es un mensaje secreto.";
console.log("Sifrado y Descifrado Simetrico:");
let claseCifer = new cifrado();
let s = claseCifer.cifrarSimetrico(mensaje);
console.log("Sifrado:", s);
console.log(
  "Decifrado:",
  claseCifer.descifrarSimetrico(s.encryptedData, s.clave, s.iv)
);
