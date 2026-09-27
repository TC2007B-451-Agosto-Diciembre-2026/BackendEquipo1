import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from 'src/database/database.module';

@Injectable()
export class StatsRepository {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    async getSummary() {
        const [rows] = await this.pool.query<RowDataPacket[]>(`SELECT 
        COUNT(*) AS totalReports,
        SUM(CASE WHEN status_id = 1 AND deleted_at IS NULL THEN 1 ELSE 0 END) AS pendingReports,
        SUM(CASE WHEN status_id = 2 AND deleted_at IS NULL THEN 1 ELSE 0 END) AS approvedReports,
        SUM(CASE WHEN status_id = 3 AND deleted_at IS NULL THEN 1 ELSE 0 END) AS rejectedReports
        FROM reports`);

      const row = rows[0] || {};
      return {
        totalReports: Number(row.totalReports || 0),
        pendingReports: Number(row.pendingReports || 0),
        approvedReports: Number(row.approvedReports || 0),
        rejectedReports: Number(row.rejectedReports || 0),
      }
    }

    async getByCategory() {
        const [rows] = await this.pool.query<RowDataPacket[]>(`SELECT 
        c.category_id AS categoryId,
        c.name AS categoryName,
        COUNT(r.report_id) AS total
        FROM categories c
        LEFT JOIN reports r ON c.category_id = r.category_id AND r.deleted_at IS NULL
        GROUP BY c.category_id, c.name
        ORDER BY total DESC`);

        return rows.map((row) => ({ 
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            total: Number(row.total),
         }));
    }

    async getByStatus() {
    const [rows] = await this.pool.query<RowDataPacket[]>(`
      SELECT 
        s.status_id AS statusId,
        s.name AS statusName,
        COUNT(r.report_id) AS total
      FROM validation_statuses s
      LEFT JOIN reports r ON s.status_id = r.status_id AND r.deleted_at IS NULL
      GROUP BY s.status_id, s.name
      ORDER BY s.status_id ASC
    `);

    return rows.map((row) => ({
      statusId: row.statusId,
      statusName: row.statusName,
      total: Number(row.total),
    }));
  }

  async getMonthly() {
    const [rows] = await this.pool.query<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS total
      FROM reports
      WHERE deleted_at IS NULL
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    return rows.map((row) => ({
      month: row.month,
      total: Number(row.total),
    }));
  }
    
}