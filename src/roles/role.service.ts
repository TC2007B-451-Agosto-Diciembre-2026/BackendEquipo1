import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RolesRepository } from "./role.repository";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Role } from "./entities/role-entity";
import { RoleResponseDto } from "./dto/role-response.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignRoleDto } from './dto/assign-role.dto';

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
        if (!dto.name) {
            throw new BadRequestException('Se requiere el campo name para actualizar');
        }
        await this.rolesRepository.update(id, dto.name)
        return { message: 'Rol actualizado con éxito' };
    }

    async delete(id: number) {
        await this.findOne(id);
        await this.rolesRepository.delete(id);
        return { message: 'Rol eliminado con éxito' }
    }

    async assignRole(userId: number, dto: AssignRoleDto) {
    await this.findOne(dto.roleId);
    const updated = await this.rolesRepository.assignRole(userId, dto.roleId);
    if (!updated) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado o inactivo`);
    }
    return { message: `Rol ${dto.roleId} asignado con éxito al usuario ${userId}` };
  }

}