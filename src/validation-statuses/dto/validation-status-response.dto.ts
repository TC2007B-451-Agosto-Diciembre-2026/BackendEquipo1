import { ApiProperty } from '@nestjs/swagger';

export class ValidationStatusResponseDto {
  @ApiProperty({ example: 1, description: 'ID del estado de validación' })
  id!: number;

  @ApiProperty({ example: 'En revisión', description: 'Nombre del estado de validación' })
  name!: string;
}
export class MessageResponseDto {
  @ApiProperty({ example: 'Operación realizada con éxito' })
  message!: string;
}