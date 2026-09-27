import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ description: 'Nombre de rol', example: 'Administrador' })
    @IsString()
    @IsNotEmpty()
    name!: string;
}