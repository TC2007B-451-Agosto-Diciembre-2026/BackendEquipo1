import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { User } from './entities/user.entity';

const COLUMNS = 'user_id, role_id, name, email, password_hash, created_at, updated_at, deleted_at';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email],
    );
    return rows[0] ? toEntity(rows[0]) : undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM users WHERE user_id = ? AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] ? toEntity(rows[0]) : undefined;
  }

  async save(data: { email: string; passwordHash: string; name: string; roleId?: number }): Promise<User> {
    const roleId = data.roleId ?? 2; // Rol 'User' por defecto

    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO users (role_id, name, email, password_hash) 
       VALUES (?, ?, ?, ?)`,
      [roleId, data.name, data.email, data.passwordHash],
    );

    return (await this.findById(result.insertId))!;
  }

  async update(id: number, data: { email?: string; passwordHash?: string; name?: string }): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.email) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.passwordHash) {
      fields.push('password_hash = ?');
      values.push(data.passwordHash);
    }
    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (fields.length === 0) return;

    values.push(id);
    await this.pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ? AND deleted_at IS NULL`,
      values,
    );
  }

  async delete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [id],
    );
  }
}

function toEntity(row: any): User {
  const user = new User();
  user.id = row.user_id;
  user.role = row.role_id ? String(row.role_id) : undefined;
  user.name = row.name;
  user.email = row.email;
  user.passwordHash = row.password_hash;
  user.createdAt = row.created_at ? new Date(row.created_at) : undefined;
  user.updatedAt = row.updated_at ? new Date(row.updated_at) : undefined;
  user.deletedAt = row.deleted_at ? new Date(row.deleted_at) : undefined;
  return user;
}

