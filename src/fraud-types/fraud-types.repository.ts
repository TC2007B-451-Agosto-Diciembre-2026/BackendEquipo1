import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from 'src/database/database.module';
import { FraudTypeEntity } from './entities/fraud-type.entity';

@Injectable()
export class FraudTypeRepository {
    constructor(@Inject (DB_POOL) private readonly pool: Pool) {}

    async create(name: string): Promise<number> {
        const query = 'INSERT INTO fraud_types (name) VALUES (?)';
        const [result] = await this.pool.execute<ResultSetHeader>(query, [name]);
        return result.insertId;
    }

    async findAll(): Promise<FraudTypeEntity[]> {
        const query = 'SELECT fraud_type_id, name FROM fraud_types ORDER BY fruad_type_id ASC';
        const [rows] = await this.pool.execute<RowDataPacket[]>(query);
        return rows as FraudTypeEntity[];
    }

    async findById(fraud_type_id: number): Promise<FraudTypeEntity | null> {
        const query = 'SELECT fraud_type_id, name FROM fraud_types WHERE fraud_type_id = ?';
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [fraud_type_id]);
        const items = rows as FraudTypeEntity[];
        return items.length > 0 ? items[0] : null;
    }
}
