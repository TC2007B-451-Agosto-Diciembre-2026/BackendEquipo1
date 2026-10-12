import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CategoriesService } from '../categories/category.service';
import { ReporteService } from './reporte.service';

@ApiTags('public')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 60, ttl: 60_000 } })
@Controller('public')
export class PublicController {
  constructor(
    private readonly reports: ReporteService,
    private readonly categories: CategoriesService,
  ) {}

  @Get('reports')
  @ApiOperation({ summary: 'Reportes aprobados, sin iniciar sesión y sin datos del autor' })
  findReports() {
    return this.reports.findPublic();
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Detalle de un reporte aprobado, sin iniciar sesión' })
  findReport(@Param('id', ParseIntPipe) id: number) {
    return this.reports.findPublicOne(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Categorías, sin iniciar sesión' })
  findCategories() {
    return this.categories.findAll();
  }
}
