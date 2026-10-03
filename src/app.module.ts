import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './roles/roles.module';
import { FraudTypesModule } from './fraud-types/fraud-type.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reportes/reporte.module';
import { ValidationStatusesModule } from './validation-statuses/validation-status.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    DatabaseModule,
    RolesModule,
    FraudTypesModule,
    AuthModule,
    ReportsModule,
    ValidationStatusesModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
