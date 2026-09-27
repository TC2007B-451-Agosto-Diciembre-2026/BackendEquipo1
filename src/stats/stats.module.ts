import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { StatsController } from './stats.controller';
import { StatsRepository } from './stats.repository';
import { StatsService } from './stats.service';

@Module({
  imports: [DatabaseModule],
  controllers: [StatsController],
  providers: [StatsService, StatsRepository],
  exports: [StatsService, StatsRepository],
})
export class StatsModule {}