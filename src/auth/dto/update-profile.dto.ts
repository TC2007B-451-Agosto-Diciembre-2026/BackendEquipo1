import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Tu Nombre' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name?: string;

  @ApiPropertyOptional({ example: 'nuevo_email@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El formato de email no es válido' })
  @MaxLength(150, { message: 'El correo no puede exceder los 150 caracteres' })
  email?: string;

  @ApiPropertyOptional({ example: '5512345678' })
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'El teléfono debe tener entre 10 y 15 dígitos' })
  phone?: string;

  @ApiPropertyOptional({ example: 'nuevaClave123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;
}