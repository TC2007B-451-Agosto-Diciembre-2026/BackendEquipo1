import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CategoriesService } from '../categories/category.service';
import { StatsService } from '../stats/stats.service';
import { ReporteService } from './reporte.service';

@ApiTags('public')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: () => Number(process.env.PUBLIC_RATE_LIMIT ?? 60), ttl: 60_000 } })
@Controller('public')
export class PublicController {
  constructor(
    private readonly reports: ReporteService,
    private readonly categories: CategoriesService,
    private readonly stats: StatsService,
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

  @Get('stats/summary')
  @ApiOperation({ summary: 'Resumen de estadísticas, sin iniciar sesión' })
  getSummary() {
    return this.stats.getSummary();
  }

  @Get('stats/by-category')
  @ApiOperation({ summary: 'Reportes por categoría, sin iniciar sesión' })
  getByCategory() {
    return this.stats.getByCategory();
  }

  @Get('stats/monthly')
  @ApiOperation({ summary: 'Reportes por mes, sin iniciar sesión' })
  getMonthlyStats() {
    return this.stats.getMonthly();
  }
}
