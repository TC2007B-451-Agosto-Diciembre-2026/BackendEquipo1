import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from 'src/database/database.module';
import { fraudTypeEntity } from './entities/fraud-type.entity';

@Injectable()
export class FraudTypesRepository {
    constructor(@Inject (DB_POOL) private readonly pool: Pool) {}

    async create(name: string): Promise<number> {
        const query = 'INSERT INTO fraud_types (name) VALUES (?)';
        const [result] = await this.pool.execute<ResultSetHeader>(query, [name]);
        return result.insertId;
    }

    async findAll(): Promise<fraudTypeEntity[]> {
        const query = 'SELECT fraud_type_id AS id, name FROM fraud_types ORDER BY fraud_type_id ASC';
        const [rows] = await this.pool.execute<RowDataPacket[]>(query);
        return rows as fraudTypeEntity[];
    }

    async findById(fraud_type_id: number): Promise<fraudTypeEntity | null> {
        const query = 'SELECT fraud_type_id, name FROM fraud_types WHERE fraud_type_id = ?';
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [fraud_type_id]);
        const items = rows as fraudTypeEntity[];
        return items.length > 0 ? items[0] : null;
    }

    async update(id: number, name: string): Promise<void> {
    await this.pool.query(
      'UPDATE fraud_types SET name = ? WHERE fraud_type_id = ?',
      [name, id],
    );
  }

  async countReportsWithFraudType(id: number): Promise<number> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM reports WHERE fraud_type_id = ? AND deleted_at IS NULL',
      [id],
    );
    return rows[0].count;
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM fraud_types WHERE fraud_type_id = ?', [id]);
  }
}

