const crypto = require("crypto");
require('dotenv').config({ path: '../.env' });
const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32); // 32-byte key
const iv = Buffer.alloc(16, 0); // Initialization Vector (fixed for simplicity)

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
