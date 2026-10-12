import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  @IsNotEmpty()
  @MaxLength(150, { message: 'El correo no puede exceder los 150 caracteres' })
  email!: string;

  @ApiProperty({ example: 'secreto123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name!: string;

  @ApiPropertyOptional({ example: '5512345678', description: 'Teléfono (opcional)' })
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'El teléfono debe tener entre 10 y 15 dígitos' })
  phone?: string;
}