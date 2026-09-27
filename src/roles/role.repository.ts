import { Injectable, Inject } from "@nestjs/common";
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Role } from "./entities/role-entity";

const COLUMNS = 'role_id, name';

@Injectable()
export class RolesRepository {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    async create(name: string): Promise<number> {
        const query = 'INSERT INTO roles (name) VALUES (?)';
        const [result] = await this.pool.execute<ResultSetHeader>(query, [name]);
        return result.insertId;
    }

    async findAll(): Promise<Role[]> {
        const query = `SELECT ${COLUMNS} FROM roles ORDER BY role_id ASC`;
        const [rows] = await this.pool.query<RowDataPacket[]>(query);
        return rows.map(toEntity);
    }

    async findById(role_id: number): Promise<Role | null> {
        const query = `SELECT ${COLUMNS} FROM roles WHERE role_id = ?`;
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [role_id]);
        const roles = rows as Role[];
        return roles.length > 0 ? roles[0] : null;
    }

   async update(id: number, name: string): Promise<void> {
    await this.pool.query('UPDATE roles SET name = ? WHERE role_id = ?', [
      name,
      id,
    ]);
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM roles WHERE role_id = ?', [id]);
  }

async assignRole(userId: number, roleId: number): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      'UPDATE users SET role_id = ? WHERE user_id = ? AND deleted_at IS NULL',
      [roleId, userId],
    );
    return result.affectedRows > 0;
  }

}
function toEntity(row: any): Role {
const role = new Role()
role.role_id = row.role_id;
role.name = row.name;
return role;
}