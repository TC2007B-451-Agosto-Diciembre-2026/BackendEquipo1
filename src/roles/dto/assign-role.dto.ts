import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 2, description: 'ID del rol a asignar' })
  @IsInt({ message: 'El roleId debe ser un número entero' })
  @IsNotEmpty({ message: 'El roleId es obligatorio' })
  roleId!: number;
}