import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Report } from './entities/reporte-entity';

@Injectable()
export class ReporteRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<Report[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT r.report_id, r.title, r.description, r.image_path, r.fraud_probability, r.created_at, c.name AS categoryName, s.name AS statusName FROM reports r LEFT JOIN categories c ON r.category_id  = c.category_id  LEFT JOIN validation_statuses s ON r.status_id = s.status_id WHERE r.deleted_at  IS null ORDER BY r.created_at DESC' 
    );
    return rows.map(toEntity);
  }

  async findByUserId(userId: number): Promise<Report[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM reports WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
      [userId],
    );
    return rows.map(toEntity);
  }

  async findById(id: number): Promise<Report | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM reports WHERE report_id = ? AND deleted_at IS NULL',
      [id],
    );
    return rows[0] ? toEntity(rows[0]) : undefined;
  }

  async save(userId: number, dto: CreateReporteDto): Promise<Report> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO reports (user_id, category_id, status_id, case_type, title, description)
   VALUES (?, ?, 1, ?, ?, ?)`,
      [userId, dto.categoryId, dto.caseType, dto.title, dto.description],
    );
    return (await this.findById(result.insertId))!;
  }

  async update(id: number, dto: UpdateReporteDto): Promise<void> {
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

    if (fields.length === 0) return;

    values.push(id);
    await this.pool.query(
      `UPDATE reports SET ${fields.join(', ')} WHERE report_id = ? AND deleted_at IS NULL`,
      values,
    );
  }

  async updateImagePath(id: number, filename: string): Promise<void> {
    await this.pool.query(
      'UPDATE reports SET image_path = ? WHERE report_id = ? AND deleted_at IS NULL',
      [filename, id],
    );
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

  async findDeleted() {
    const [rows] = await this.pool.query('SELECT * FROM reports WHERE deleted_at IS NOT NULL');
  return rows;
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
    categoryName: row.category_name ?? row.categoryName ?? null, // <-- Mapeado
    statusName: row.status_name ?? row.statusName ?? null,       // <-- Mapeado
    caseType: row.case_type,
    title: row.title,
    description: row.description,
    imagePath: row.image_path ?? null,
    fraudProbability: row.fraud_probability !== null && row.fraud_probability !== undefined 
      ? Number(row.fraud_probability) 
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    deletedAt: row.deleted_at,
  };
}


