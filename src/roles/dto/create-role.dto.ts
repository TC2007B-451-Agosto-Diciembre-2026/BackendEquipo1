import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ description: 'Nombre de rol', example: 'Administrador' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50, { message: 'El nombre no puede exceder los 50 caracteres' })
    name!: string;
}