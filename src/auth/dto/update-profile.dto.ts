import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Tu Nombre' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'nuevo_email@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El formato de email no es válido' })
  email?: string;

  @ApiPropertyOptional({ example: 'nuevaClave123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;
}