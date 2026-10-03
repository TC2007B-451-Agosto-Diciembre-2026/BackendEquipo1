import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { FraudTypesService } from './fraud-type.service';
import { CreateFraudTypeDto } from './dto/create-fraud-type.dto';
import { UpdateFraudTypeDto } from './dto/update-fraud-type.dto';

@ApiTags('fraud-types')
@ApiBearerAuth()
@UseGuards(AuthGuard)

@Controller('fraud-types')
export class FraudTypesController {
    constructor(private readonly fraudTypesService: FraudTypesService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tipo de fraude' })
    create(@Body() dto: CreateFraudTypeDto) {
        return this.fraudTypesService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos los tipos de fraude' })
    findAll() {
        return this.fraudTypesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar un tipo de fraude en específico' })
    findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fraudTypesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un tipo de fraude existente' })
    update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFraudTypeDto,
    ) {
    return this.fraudTypesService.update(id, dto);
    }

    @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de fraude' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fraudTypesService.remove(id);
  }
}