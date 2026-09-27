import { ApiProperty } from "@nestjs/swagger"; 
import { Role } from "../entities/role-entity";

export class RoleResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Administrador' })
    name!: string;

    static fromEntity( role: Role): RoleResponseDto {
        const dto = new RoleResponseDto();
        dto.id = role.role_id
        dto.name = role.name
        return dto
    }
}
