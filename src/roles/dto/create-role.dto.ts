import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ description: 'Nombre de rol', example: 'Administrador' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name!: string;
}