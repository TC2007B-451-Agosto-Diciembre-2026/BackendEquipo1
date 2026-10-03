import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { FraudTypesController } from './fraud-type.controller';
import { FraudTypesService } from './fraud-type.service';
import { FraudTypesRepository } from './fraud-type.repository';

@Module({
    imports: [DatabaseModule],
    controllers: [FraudTypesController],
    providers: [FraudTypesService, FraudTypesRepository],
    exports: [FraudTypesService, FraudTypesRepository],
})
export class FraudTypesModule {}