import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateReporteDto } from './create-reporte.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateReporteDto extends PartialType(CreateReporteDto) {
  @ApiPropertyOptional({ example: 2, description: 'ID del nuevo estado' })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
