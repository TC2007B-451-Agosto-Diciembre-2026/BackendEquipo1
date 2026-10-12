import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Report } from './entities/reporte-entity';

const COLUMNS = `
  SELECT r.*, c.name AS category_name, s.name AS status_name, u.name AS reporter_name, u.email AS reporter_email,
  (SELECT e.content FROM evidence e WHERE e.report_id = r.report_id AND e.evidence_type = 'url' ORDER BY e.evidence_id LIMIT 1) AS evidence_url
  FROM reports r LEFT JOIN categories c ON r.category_id = c.category_id
  LEFT JOIN validation_statuses s ON r.status_id = s.status_id LEFT JOIN users u ON r.user_id = u.user_id`;

@Injectable()
export class ReporteRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<Report[]> {
    const query = `${COLUMNS} WHERE r.deleted_at IS NULL ORDER BY r.created_at DESC;`;
    const [rows]: any = await this.pool.query(query);
    return rows.map(toEntity);
  }

  async findApproved(): Promise<Report[]> {
    const query = `${COLUMNS} WHERE r.deleted_at IS NULL AND r.status_id = 2 ORDER BY r.created_at DESC;`;
    const [rows]: any = await this.pool.query(query);
    return rows.map(toEntity);
  }

  async findByUserId(userId: number): Promise<Report[]> {
    const query = ` ${COLUMNS} WHERE r.user_id = ? AND r.deleted_at IS NULL ORDER BY r.created_at DESC;`;
    const [rows]: any = await this.pool.query(query, [userId]);
    return rows.map(toEntity);
  }

  async findById(id: number): Promise<Report | null> {
    const query = ` ${COLUMNS} WHERE r.report_id = ?`;
    const [rows]: any = await this.pool.query(query, [id]);
    if (!rows || rows.length === 0) return null;
    return toEntity(rows[0]);
  }

  async save(userId: number, dto: CreateReporteDto): Promise<Report> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO reports (user_id, category_id, status_id, case_type, title, description)
   VALUES (?, ?, 1, ?, ?, ?)`,
      [userId, dto.categoryId, dto.caseType, dto.title, dto.description],
    );
    if (dto.evidenceUrl) {
      await this.addEvidence(result.insertId, 'url', dto.evidenceUrl);
    }
    return (await this.findById(result.insertId))!;
  }

  async update(id: number, dto: UpdateReporteDto): Promise<void> {
    console.log('📦 DTO recibido en el repositorio:', dto);

    const fields: string[] = [];
    const values: any[] = [];

    if (dto.categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(dto.categoryId);
    }
    if (dto.caseType !== undefined) {
      fields.push('case_type = ?');
      values.push(dto.caseType);
    }
    if (dto.title !== undefined) {
      fields.push('title = ?');
      values.push(dto.title);
    }
    if (dto.description !== undefined) {
      fields.push('description = ?');
      values.push(dto.description);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Se requiere al menos un campo para actualizar :)');
    }

    values.push(id);
    await this.pool.query(
      `UPDATE reports SET ${fields.join(', ')} WHERE report_id = ? AND deleted_at IS NULL`,
      values,
    );
  }

  async addEvidence(reportId: number, type: string, content: string): Promise<number> {
    const [result] = await this.pool.query<ResultSetHeader>(
      'INSERT INTO evidence (report_id, evidence_type, content) VALUES (?, ?, ?)',
      [reportId, type, content],
    );
    return result.insertId;
  }

  async updateStatus(
    id: number,
    adminId: number,
    statusId: number,
    fraudProbability?: number,
  ): Promise<void> {
    await this.pool.query(
      `UPDATE reports 
       SET status_id = ?, admin_id = ?, fraud_probability = ?, approved_at = NOW() 
       WHERE report_id = ? AND deleted_at IS NULL`,
      [statusId, adminId, fraudProbability ?? null, id],
    );
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE reports SET deleted_at = NOW() WHERE report_id = ? AND deleted_at IS NULL',
      [id],
    );
  }

  async findDeleted(): Promise<Report[]> {
    const query = ` ${COLUMNS} WHERE r.deleted_at IS NOT NULL ORDER BY r.deleted_at DESC; `;
    const [rows]: any = await this.pool.query(query);
    return rows.map(toEntity);
  }

  async findDeletedById(id: number) {
    const [rows] = await this.pool.query('SELECT * FROM reports WHERE report_id = ? AND deleted_at IS NOT NULL', [id]);
    return rows[0] || null;
  }

  async restore(id: number) {
    await this.pool.query('UPDATE reports SET deleted_at = NULL WHERE report_id = ?', [id]);
  }
}

function toEntity(row: any): Report {
  return {
    id: row.report_id,
    userId: row.user_id,
    adminId: row.admin_id,
    categoryId: row.category_id,
    statusId: row.status_id,
    categoryName: row.category_name ?? row.categoryName ?? null, 
    statusName: row.status_name ?? row.statusName ?? null, 
    reporterName: row.reporter_name ?? null,    
    reporterEmail: row.reporter_email ?? null,   
    caseType: row.case_type,
    title: row.title,
    evidenceUrl: row.evidence_url ?? row.evidenceUrl ?? null,
    description: row.description,
    fraudProbability: row.fraud_probability !== null && row.fraud_probability !== undefined 
      ? Number(row.fraud_probability) 
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    deletedAt: row.deleted_at,
  };
}
