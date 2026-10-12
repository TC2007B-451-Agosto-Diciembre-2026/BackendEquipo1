import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { verify } from "./jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const header: string = req.headers.authorization ?? '';
        if (!header.startsWith('Bearer ')) {
            throw new UnauthorizedException('Falta el token');
        }
        const payload = verify(header.slice('Bearer '.length));
        if (!payload || payload.type !== 'access') {
            throw new UnauthorizedException('Token inválido o expirado');
        }
        const [rows] = await this.pool.query<RowDataPacket[]>(
            'SELECT role_id FROM users WHERE user_id = ? AND deleted_at IS NULL',
            [payload.sub],
        );
        if (!rows[0]) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
        req.user = { ...payload, role_id: Number(rows[0].role_id) };
        return true;
    }
}
