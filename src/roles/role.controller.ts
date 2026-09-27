import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './role.service';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}
    
    @Get()
    @ApiOperation({ summary: 'Obtener todos los roles' })
    @ApiResponse({ status: 200, description: 'Lista de roles obtenida' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')    
    @ApiOperation({ summary: 'Obtener rol por Id' })
    @ApiResponse({ status: 200, description: 'Rol encontrado' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOne(id);
    }
   
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo rol' })
    @ApiResponse({ status: 201, description: 'Rol creado con exito' })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un rol existente' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoleDto,
    ) {
        return this.rolesService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un rol' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.delete(id);
    }

    @Patch('assign/:userId')
    @ApiOperation({ summary: 'Asignar o cambiar el rol de un usuario en específico' })
    assignRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: AssignRoleDto,
    ) {
        return this.rolesService.assignRole(userId, dto);
    }

}
