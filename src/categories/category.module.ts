import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CategoriesController } from './category.controller';
import { CategoriesService } from './category.service';
import { CategoriesRepository } from './category.repository';

@Module({
    imports: [DatabaseModule],
    controllers: [CategoriesController],
    providers: [CategoriesService, CategoriesRepository],
    exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}