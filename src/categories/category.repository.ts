import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from 'src/database/database.module';
import { categoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesRepository {
    constructor(@Inject (DB_POOL) private readonly pool: Pool) {}

    async create(name: string): Promise<number> {
        const query = 'INSERT INTO categories (name) VALUES (?)';
        const [result] = await this.pool.execute<ResultSetHeader>(query, [name]);
        return result.insertId;
    }

    async findAll(): Promise<categoryEntity[]> {
        const query = 'SELECT category_id AS id, name FROM categories ORDER BY category_id ASC';
        const [rows] = await this.pool.execute<RowDataPacket[]>(query);
        return rows as categoryEntity[];
    }

    async findById(category_id: number): Promise<categoryEntity | null> {
        const query = 'SELECT category_id, name FROM categories WHERE category_id = ?';
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [category_id]);
        const items = rows as categoryEntity[];
        return items.length > 0 ? items[0] : null;
    }

    async update(id: number, name: string): Promise<void> {
    await this.pool.query(
      'UPDATE categories SET name = ? WHERE category_id = ?',
      [name, id],
    );
  }

  async countReportsWithCategory(id: number): Promise<number> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM reports WHERE category_id = ? AND deleted_at IS NULL',
      [id],
    );
    return rows[0].count;
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM categories WHERE category_id = ?', [id]);
  }
}

