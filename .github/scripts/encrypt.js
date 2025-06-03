const fs = require("fs");
const crypto = require("crypto");
const yaml = require("js-yaml");

const inputPath = "data/parcours.yaml";
const outputPath = "public/parcours.enc";
const keyHex = process.env.YAML_ENCRYPT_KEY;

if (!keyHex) {
  console.error("\u274C Cl\u00e9 de chiffrement manquante. YAML_ENCRYPT_KEY non d\u00e9fini.");
  process.exit(1);
}

const key = Buffer.from(keyHex, "hex");
if (key.length !== 32) {
  console.error("\u274C Cl\u00e9 invalide : la cl\u00e9 doit faire 32 octets (256 bits). HEX attendu.");
  process.exit(1);
}

try {
  const file = fs.readFileSync(inputPath, "utf-8");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(file, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const output = Buffer.concat([iv, encrypted, tag]);
  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync(outputPath, output.toString("base64"));

  console.log("\u2705 Fichier chiffr\u00e9 avec succ\u00e8s :", outputPath);
} catch (err) {
  console.error("\u274C Erreur de chiffrement :", err);
  process.exit(1);
}
