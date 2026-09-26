import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Report } from '../entities/reporte-entity';

export class ReportResponseDto {
    @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
    id: string | undefined;

    @ApiProperty({ example: 'Transaccion exitosa' })
    title: string | undefined;

    @ApiProperty({ example: 'https://evidencia.com/comprobante.pdf' })
    evidenceUrl: string | undefined;

    @ApiPropertyOptional({ example: 'Inconsistencia en el monto' })
    Description?: string;

    @ApiProperty({ example: 'En revision' })
    status: string | undefined;

    @ApiProperty({ example: '2026-09-23T08:00:00.000Z' })
    createdAt!: Date;

    static fromEntity(report: Report): ReportResponseDto {
        const dto = new ReportResponseDto();
        dto.id = report.id;
        dto.title = report.title;
        dto.evidenceUrl = report.evidenceUrl;
        dto.Description = report.description;
        dto.status = report.status;
        dto.createdAt = report.createdAt!;
        return dto;
    }
}
