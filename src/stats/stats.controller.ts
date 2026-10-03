import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import {
  FraudTypeStatsDto,
  MonthlyStatsDto,
  StatusStatsDto,
  SummaryStatsDto,
} from './dto/stats-response.dto';
import { StatsService } from './stats.service';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtener métricas globales de reportes' })
  @ApiOkResponse({
    description: 'Resumen global de totales y estados',
    type: SummaryStatsDto,
  })
  getSummary() {
    return this.service.getSummary();
  }

  @Get('by-fraud-type')
  @ApiOperation({ summary: 'Obtener distribución de reportes por tipo de fraude' })
  @ApiOkResponse({
    description: 'Conteo de reportes desglosado por tipo de fraude',
    type: [FraudTypeStatsDto],
  })
  getByFraudType() {
    return this.service.getByFraudType();
  }

  @Get('by-status')
  @ApiOperation({ summary: 'Obtener distribución de reportes por estado de validación' })
  @ApiOkResponse({
    description: 'Conteo de reportes desglosado por estado de validación',
    type: [StatusStatsDto],
  })
  getByStatus() {
    return this.service.getByStatus();
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Obtener tendencia mensual de reportes registrados' })
  @ApiOkResponse({
    description: 'Histórico de reportes agrupados por mes',
    type: [MonthlyStatsDto],
  })
  getMonthly() {
    return this.service.getMonthly();
  }
}