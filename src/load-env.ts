import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

if (!process.env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en .env (copia .env.example a .env)');
}
