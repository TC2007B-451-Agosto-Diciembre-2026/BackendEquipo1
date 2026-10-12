import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReporteController } from './reporte.controller';
import { EvidenceController } from './evidence.controller';
import { ReporteRepository } from './reporte.repository';
import { ReporteService } from './reporte.service';
import { AuthModule } from 'src/auth/auth.module';

@Module ({
    imports: [DatabaseModule, AuthModule],
    controllers: [ReporteController, EvidenceController],
    providers: [ReporteService, ReporteRepository],
    exports: [ReporteService, ReporteRepository],
})
export class ReportsModule {}
