import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReporteDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de fraude del reporte' })
  @IsInt({ message: 'El fraudTypeId debe ser un número entero' })
  @IsNotEmpty({ message: 'El fraudTypeId es obligatorio' })
  fraudTypeId!: number;

  @ApiProperty({ example: 'report', enum: ['señalamiento', 'report'], description: 'Tipo de caso' })
  @IsString()
  @IsIn(['señalamiento', 'report'], { message: 'El caseType debe ser "señalamiento" o "report"' })
  @IsNotEmpty({ message: 'El caseType es obligatorio' })
  caseType!: string;

  @ApiProperty({ example: 'Sitio clonado de banco', description: 'Título del reporte (máx. 150 caracteres)' })
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(150, { message: 'El título no puede exceder los 150 caracteres' })
  title!: string;

  @ApiProperty({ example: 'Se identificó un dominio malicioso que suplanta la identidad bancaria.', description: 'Descripción detallada' })
  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;
}