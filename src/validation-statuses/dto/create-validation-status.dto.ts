import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateValidationStatusDto {
  @ApiProperty({ example: 'En investigación', description: 'Nombre del estado de validación' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(20, { message: 'El nombre no puede exceder los 20 caracteres' })
  name!: string;
}