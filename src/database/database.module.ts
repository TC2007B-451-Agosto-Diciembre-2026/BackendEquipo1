import { Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { createPool } from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
export const DB_POOL = 'DB_POOL';

// En Docker Compose se define en .env (ej. mysql://user:pass@db:3306/sentinel).
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/sentinel';
@Module({
providers: [
{
provide: DB_POOL,
useFactory: () => {
console.log('Conectando a ' + DATABASE_URL.replace(/\/\/.*@/, '//***@'));
return createPool({ uri: DATABASE_URL });
},
},
],
exports: [DB_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
constructor(@Inject(DB_POOL) private readonly pool: Pool) {}
onModuleDestroy() {
return this.pool.end();
}
}