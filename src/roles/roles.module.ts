import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RolesController } from './role.controller';
import { RolesRepository } from './role.repository';
import { RolesService } from './role.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService, RolesRepository],
})
export class RolesModule {}