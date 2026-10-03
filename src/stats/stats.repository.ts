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

    async getByFraudType() {
        const [rows] = await this.pool.query<RowDataPacket[]>(`SELECT 
        f.fraud_type_id AS fraudTypeId,
        f.name AS fraudTypeName,
        COUNT(r.report_id) AS total
        FROM fraud_types f
        LEFT JOIN reports r ON f.fraud_type_id = r.fraud_type_id AND r.deleted_at IS NULL
        GROUP BY f.fraud_type_id, f.name
        ORDER BY total DESC`);

        return rows.map((row) => ({ 
            fraudTypeId: row.fraudTypeId,
            fraudTypeName: row.fraudTypeName,
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