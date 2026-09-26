import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './roles/roles.module';
import { FraudTypesModule } from './fraud-types/fraud-types.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reportes/reporte.module';

@Module({
  imports: [
    DatabaseModule,
    RolesModule,
    FraudTypesModule,
    AuthModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
