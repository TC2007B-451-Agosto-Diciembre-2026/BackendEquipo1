// Genera password_hash y password_salt con el mismo algoritmo que
// src/auth/auth.service.ts (scrypt, sal de 16 bytes, hash de 64 bytes, en hex).
// Sirve para crear usuarios directamente en SQL (por ejemplo, en db/seed.sql).
//
// Uso: node scripts/hash-password.mjs "MiContraseña123"
import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "<contraseña>"');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');

console.log(`password_hash: ${hash}`);
console.log(`password_salt: ${salt}`);
