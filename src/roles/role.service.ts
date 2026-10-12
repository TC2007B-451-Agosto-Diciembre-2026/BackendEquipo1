import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RolesRepository } from "./role.repository";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Role } from "./entities/role-entity";
import { RoleResponseDto } from "./dto/role-response.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role as BaseRole } from '../auth/roles.enum';

/**
 * Servicio encargado de coordinar la lógica de negocio relativa a los Roles de usuario.
 */
@Injectable()
export class RolesService{
    constructor(private readonly rolesRepository: RolesRepository) {}


/**
   * Crea un nuevo rol en el sistema.
   * @param createRoleDto - Datos de creación validados por ValidationPipe.
   * @returns El objeto del rol recién registrado.
   */
    async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
  const id = await this.rolesRepository.create(createRoleDto.name);
  return {
    id: id,
    name: createRoleDto.name,
  };
}

/**
   * Consulta el catálogo completo de roles.
   * @returns Lista de roles registrados.
   */
    async findAll(): Promise<Role[]>{
        return this.rolesRepository.findAll();
    }

    /**
   * Busca un rol por su identificador único.
   * @param id - Identificador numérico del rol.
   * @throws NotFoundException si el id suministrado no coincide con ningún rol.
   */
    async findOne(id: number): Promise<Role> {
        const role = await this.rolesRepository.findById(id); 
        if (!role) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
        }
        return role;
    }

    async update(id: number, dto: UpdateRoleDto) {
        await this.findOne(id);
        assertNotBaseRole(id);
        if (!dto.name) {
            throw new BadRequestException('Se requiere el campo name para actualizar');
        }
        await this.rolesRepository.update(id, dto.name)
        return { message: 'Rol actualizado con éxito' };
    }

    async delete(id: number) {
        await this.findOne(id);
        assertNotBaseRole(id);
        if (await this.rolesRepository.countUsersWithRole(id) > 0) {
            throw new BadRequestException('No se puede eliminar un rol que tiene usuarios asignados');
        }
        await this.rolesRepository.delete(id);
        return { message: 'Rol eliminado con éxito' }
    }

}

function assertNotBaseRole(id: number) {
    if (id === BaseRole.ADMIN || id === BaseRole.USER) {
        throw new BadRequestException('Los roles admin y usuario no se pueden modificar ni eliminar');
    }
}
