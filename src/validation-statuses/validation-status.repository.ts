import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

export interface ValidationStatus {
  id: number;
  name: string;
}

@Injectable()
export class ValidationStatusesRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<ValidationStatus[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT status_id AS id, name FROM validation_statuses ORDER BY status_id ASC',
    );
    return rows as ValidationStatus[];
  }

  async findById(id: number): Promise<ValidationStatus | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT status_id AS id, name FROM validation_statuses WHERE status_id = ?',
      [id],
    );
    return rows[0] as ValidationStatus | undefined;
  }

  async save(name: string): Promise<ValidationStatus> {
    const [result] = await this.pool.query<ResultSetHeader>(
      'INSERT INTO validation_statuses (name) VALUES (?)',
      [name],
    );
    return { id: result.insertId, name };
  }

  async update(id: number, name: string): Promise<void> {
    await this.pool.query(
      'UPDATE validation_statuses SET name = ? WHERE status_id = ?',
      [name, id],
    );
  }

  async countReportsWithStatus(id: number): Promise<number> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM reports WHERE status_id = ? AND deleted_at IS NULL',
      [id],
    );
    return rows[0].count;
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM validation_statuses WHERE status_id = ?', [id]);
  }
}