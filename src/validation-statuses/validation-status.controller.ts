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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CreateValidationStatusDto } from './dto/create-validation-status.dto';
import { UpdateValidationStatusDto } from './dto/update-validation-status.dto';
import { ValidationStatusesService } from './validation-status.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@ApiTags('validation-statuses')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('validation-statuses')
export class ValidationStatusesController {
  constructor(private readonly service: ValidationStatusesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados de validación' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estado de validación por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estado de validación' })
  create(@Body() dto: CreateValidationStatusDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estado de validación' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateValidationStatusDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un estado de validación' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}