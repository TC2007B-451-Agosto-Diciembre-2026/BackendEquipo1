import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del reporte' })
  id!: number;

  @ApiProperty({ example: 10, description: 'ID del usuario que creó el reporte' })
  userId!: number;

  @ApiPropertyOptional({ example: 2, nullable: true, description: 'ID del administrador que revisó el reporte' })
  adminId?: number | null;

  @ApiProperty({ example: 1, description: 'ID del tipo de fraude' })
  fraudTypeId!: number;

  @ApiProperty({ example: 1, description: 'ID del estado de validación' })
  statusId!: number;

  @ApiProperty({ example: 'report', enum: ['señalamiento', 'report'], description: 'Tipo de caso' })
  caseType!: string;

  @ApiProperty({ example: 'Sitio clonado de banco', description: 'Título del reporte' })
  title!: string;

  @ApiProperty({ example: 'Se identificó un dominio malicioso que suplanta la identidad bancaria.', description: 'Descripción detallada' })
  description!: string;

  @ApiPropertyOptional({ example: '/uploads/evidencia_1710000000.png', nullable: true, description: 'Ruta estática de la imagen' })
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: 85.50, nullable: true, description: 'Probabilidad estimada de fraude (0 a 100)' })
  fraudProbability?: number | null;

  @ApiProperty({ example: '2026-09-26T16:30:00.000Z', description: 'Fecha de creación del reporte' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-26T16:30:00.000Z', description: 'Fecha de última actualización' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: '2026-09-26T17:00:00.000Z', nullable: true, description: 'Fecha de aprobación/revisión por admin' })
  approvedAt?: Date | null;
}
