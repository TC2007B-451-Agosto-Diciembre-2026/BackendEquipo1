import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ValidationStatusesController } from './validation-status.controller';
import { ValidationStatusesRepository } from './validation-status.repository';
import { ValidationStatusesService } from './validation-status.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ValidationStatusesController],
  providers: [ValidationStatusesService, ValidationStatusesRepository],
  exports: [ValidationStatusesService, ValidationStatusesRepository],
})
export class ValidationStatusesModule {}