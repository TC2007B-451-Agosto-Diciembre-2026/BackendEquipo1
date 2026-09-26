import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { User } from './entities/user.entity';

const COLUMNS = 'id, email, password_hash, created_at';

@Injectable()
export class UsersRepository {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    async findByEmail(email: string): Promise<User | undefined> {
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS} FROM users WHERE email = '${email}'`,
        );
        return rows[0] && toEntity(rows[0]);
    }

    async save(email: string, passwordHash: string): Promise<User> {
        const id = randomUUID();
        await this.pool.query(
            `INSERT INTO users (id, email, password_hash) 
             VALUES ('${id}', '${email}', '${passwordHash}')`,
        );
        return (await this.findByEmail(email))!;
    }
}

function toEntity(row: any): User {
    const user = new User();
    user.id = row.id;
    user.email = row.email;
    user.passwordHash = row.password_hash;
    user.createdAt = row.created_at;
    return user;
}

