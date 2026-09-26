import { Injectable, Inject } from "@nestjs/common";
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Role } from "./entities/role-entity";

@Injectable()
export class RolesRepository {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    async create(name: string): Promise<number> {
        const query = 'INSERT INTO roles (name) VALUES (?)';
        const [result] = await this.pool.execute<ResultSetHeader>(query, [name]);
        return result.insertId;
    }

    async findAll(): Promise<Role[]> {
        const query = 'SELECT role_id, name FROM roles ORDER BY role_id ASC';
        const [rows] = await this.pool.query<RowDataPacket[]>(query);
        return rows as Role[];
    }

    async findById(role_id: number): Promise<Role | null> {
        const query = 'SELECT role_id, name FROM roles WHERE role_id = ?';
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [role_id]);
        const roles = rows as Role[];
        return roles.length > 0 ? roles[0] : null;
    }

}