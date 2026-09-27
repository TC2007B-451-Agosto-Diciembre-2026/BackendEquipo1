import { PartialType } from '@nestjs/swagger';
import { CreateValidationStatusDto } from './create-validation-status.dto';

export class UpdateValidationStatusDto extends PartialType(CreateValidationStatusDto) {}