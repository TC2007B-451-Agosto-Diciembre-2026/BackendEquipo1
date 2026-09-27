import { ApiProperty } from '@nestjs/swagger';

export class SummaryStatsDto {
  @ApiProperty({ example: 120, description: 'Total histórico de reportes creados' })
  totalReports!: number;

  @ApiProperty({ example: 15, description: 'Reportes pendientes de revisión' })
  pendingReports!: number;

  @ApiProperty({ example: 85, description: 'Reportes aprobados / validados' })
  approvedReports!: number;

  @ApiProperty({ example: 20, description: 'Reportes rechazados o desestimados' })
  rejectedReports!: number;
}

export class CategoryStatsDto {
  @ApiProperty({ example: 1, description: 'ID de la categoría' })
  categoryId!: number;

  @ApiProperty({ example: 'Circulación y seguridad', description: 'Nombre de la categoría' })
  categoryName!: string;

  @ApiProperty({ example: 45, description: 'Total de reportes en esta categoría' })
  total!: number;
}

export class StatusStatsDto {
  @ApiProperty({ example: 1, description: 'ID del estado' })
  statusId!: number;

  @ApiProperty({ example: 'En revisión', description: 'Nombre del estado' })
  statusName!: string;

  @ApiProperty({ example: 15, description: 'Total de reportes con este estado' })
  total!: number;
}

export class MonthlyStatsDto {
  @ApiProperty({ example: '2026-09', description: 'Año y mes (YYYY-MM)' })
  month!: string;

  @ApiProperty({ example: 32, description: 'Total de reportes creados en dicho mes' })
  total!: number;
}