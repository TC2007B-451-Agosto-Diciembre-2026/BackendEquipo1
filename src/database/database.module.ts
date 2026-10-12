import { Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { createPool } from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
export const DB_POOL = 'DB_POOL';

@Module({
providers: [
{
provide: DB_POOL,
useFactory: () => {
const url = process.env.DATABASE_URL;
if (!url) {
throw new Error('Falta DATABASE_URL en .env');
}
console.log('Conectando a ' + url.replace(/\/\/.*@/, '//***@'));
return createPool({ uri: url });
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