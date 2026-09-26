import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from 'src/database/database.module';
import { Report } from './entities/reporte-entity';

const COLUMNS = `
  r.id, 
  r.owner_id, 
  r.title, 
  r.evidence_url, 
  r.contact_data, 
  r.description, 
  vs.name AS status, 
  r.created_at
`;

@Injectable()
export class ReporteRepository {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    async findAll(ownerId: string): Promise<Report[]> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            `SELECT ${COLUMNS} 
             FROM reports r
             LEFT JOIN validation_statuses vs ON r.validation_status_id = vs.status_id
             WHERE r.owner_id = ? 
             ORDER BY r.created_at DESC`,
            [ownerId],
        );
        return rows.map(toEntity);
    }

    async findById(id: string, ownerId?: string): Promise<Report | undefined> {
        let sql = `
            SELECT ${COLUMNS} 
            FROM reports r
            LEFT JOIN validation_statuses vs ON r.validation_status_id = vs.status_id
            WHERE r.id = ?
        `;
        const params: any[] = [id];

        if (ownerId) {
            sql += ` AND r.owner_id = ?`;
            params.push(ownerId);
        }

        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, params);
        return rows[0] ? toEntity(rows[0]) : undefined;
    }

    async save(
        ownerId: string, 
        report: Omit<Report, 'id' | 'ownerId' | 'createdAt'>
    ): Promise<Report> {
        const id = randomUUID();
        const description = report.description ?? null;
        // Si no mandan estado, por defecto asignamos "En revision"
        const statusName = report.status ?? 'En revision';

        await this.pool.execute(
            `INSERT INTO reports (id, owner_id, title, evidence_url, description, validation_status_id)
             VALUES (?, ?, ?, ?, ?, 
             (SELECT status_id FROM validation_statuses WHERE name = ? LIMIT 1)
             )`,
            [id, ownerId, report.title ?? null, report.evidenceUrl ?? null, description, statusName],
        );

        return (await this.findById(id, ownerId))!;
    }

    async updateStatus(id: string, ownerId: string, newStatus: string): Promise<Report | undefined> {
        await this.pool.execute(
            `UPDATE reports r
             SET r.validation_status_id = (SELECT status_id FROM validation_statuses WHERE name = ? LIMIT 1)
             WHERE r.id = ? AND r.owner_id = ?`,
            [newStatus, id, ownerId],
        );

        return this.findById(id, ownerId);
    }

    async update(
        id: string,
        ownerId: string,
        changes: Partial<Report>,
    ): Promise<Report | undefined> {
        if (changes.status) {
            await this.updateStatus(id, ownerId, changes.status);
            delete changes.status;
        }

        const columnMap: Record<string, string> = {
            title: 'title',
            evidenceUrl: 'evidence_url',
            Description: 'description',
        };

        const assignments: string[] = [];
        const values: any[] = [];

        for (const [key, value] of Object.entries(changes)) {
            if (columnMap[key] && value !== undefined) {
                assignments.push(`${columnMap[key]} = ?`);
                values.push(value);
            }
        }

        if (assignments.length > 0) {
            values.push(id, ownerId);
            await this.pool.execute(
                `UPDATE reports SET ${assignments.join(', ')} WHERE id = ? AND owner_id = ?`,
                values,
            );
        }

        return this.findById(id, ownerId);
    }

    async delete(id: string, ownerId: string): Promise<boolean> {
        const [result] = await this.pool.execute<ResultSetHeader>(
            `DELETE FROM reports WHERE id = ? AND owner_id = ?`,
            [id, ownerId],
        );
        return result.affectedRows > 0;
    }
}

function toEntity(row: any): Report {
    const report = new Report();
    report.id = row.id;
    report.ownerId = row.owner_id;
    report.title = row.title;
    report.evidenceUrl = row.evidence_url;
    report.description = row.description ?? undefined;
    report.status = row.status;
    report.createdAt = row.created_at;
    return report;
}


