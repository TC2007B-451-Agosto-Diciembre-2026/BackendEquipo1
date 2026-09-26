import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RolesController } from './role.controller';
import { RolesService } from './role.service';
import { RolesRepository } from './role.repository';

@Module({
    imports: [DatabaseModule],
    controllers: [RolesController],
    providers: [RolesService, RolesRepository],
    exports: [RolesService, RolesRepository],
})
export class RolesModule {}
