import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReportsController } from './reporte.controller';
import { ReporteRepository } from './reporte.repository';
import { ReportsService } from './reporte.service';
import { AuthModule } from 'src/auth/auth.module';

@Module ({
    imports: [DatabaseModule, AuthModule],
    controllers: [ReportsController],
    providers: [ReportsService, ReporteRepository],
})
export class ReportsModule {}
