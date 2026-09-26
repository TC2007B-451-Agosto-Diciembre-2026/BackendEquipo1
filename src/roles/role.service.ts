import { Injectable, NotFoundException } from "@nestjs/common";
import { RolesRepository } from "./role.repository";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Role } from "./entities/role-entity";

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
    async create(createRoleDto: CreateRoleDto): Promise<Role> {
  const id = await this.rolesRepository.create(createRoleDto.name);
  return {
    role_id: id,
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

}