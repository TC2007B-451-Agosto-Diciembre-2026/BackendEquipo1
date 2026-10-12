import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReporteController } from './reporte.controller';
import { EvidenceController } from './evidence.controller';
import { PublicController } from './public.controller';
import { CategoriesModule } from '../categories/category.module';
import { StatsModule } from '../stats/stats.module';
import { ReporteRepository } from './reporte.repository';
import { ReporteService } from './reporte.service';
import { AuthModule } from 'src/auth/auth.module';

@Module ({
    imports: [DatabaseModule, AuthModule, CategoriesModule, StatsModule],
    controllers: [ReporteController, EvidenceController, PublicController],
    providers: [ReporteService, ReporteRepository],
    exports: [ReporteService, ReporteRepository],
})
export class ReportsModule {}
