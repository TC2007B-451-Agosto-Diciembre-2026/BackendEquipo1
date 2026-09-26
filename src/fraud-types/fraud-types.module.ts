import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { FraudTypesController } from './fraud-types.controller';
import { FraudTypeService } from './fraud-types.service';
import { FraudTypeRepository } from './fraud-types.repository';

@Module({
    imports: [DatabaseModule],
    controllers: [FraudTypesController],
    providers: [FraudTypeService, FraudTypeRepository],
    exports: [FraudTypeService, FraudTypeRepository],
})
export class FraudTypesModule {}