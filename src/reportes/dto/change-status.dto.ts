import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({ example: 2, description: 'ID del estado de validación' })
  @IsInt({ message: 'El statusId debe ser un número entero' })
  @IsNotEmpty({ message: 'El statusId es obligatorio' })
  statusId!: number;

  @ApiPropertyOptional({ example: 85.5, description: 'Probabilidad de fraude (0.00 a 100.00)' })
  @IsNumber({}, { message: 'La probabilidad de fraude debe ser un número' })
  @Min(0, { message: 'La probabilidad mínima es 0' })
  @Max(100, { message: 'La probabilidad máxima es 100' })
  @IsOptional()
  fraudProbability?: number;
}