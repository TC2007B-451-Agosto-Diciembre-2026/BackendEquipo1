import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from './roles.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener la lista completa de usuarios registrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado — Token de acceso faltante o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido — Se requieren permisos de Administrador',
  })
  findAll() {
    return this.authService.findAllUsers();
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar el rol de un usuario por su ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del usuario al que se le actualizará el rol',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['ADMIN', 'USER'],
          example: 'ADMIN',
          description: 'Nuevo rol que se asignará al usuario',
        },
      },
      required: ['role'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rol del usuario actualizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud incorrecta — Datos del rol inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado — Token de acceso faltante o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido — Se requieren permisos de Administrador',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  updateRole(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.authService.updateUserRole(id, dto.role, Number(req.user.sub));
  }
}