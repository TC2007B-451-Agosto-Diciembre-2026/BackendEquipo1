import { ApiProperty } from '@nestjs/swagger';

export class ValidationStatus {
  @ApiProperty({ example: 1, description: 'ID del estado de validación' })
  id!: number;

  @ApiProperty({ example: 'En revisión', description: 'Nombre del estado de validación' })
  name!: string;
}