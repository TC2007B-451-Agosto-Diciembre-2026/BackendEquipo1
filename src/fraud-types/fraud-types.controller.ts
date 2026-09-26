import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { FraudTypeService } from './fraud-types.service';
import { CreateFraudTypeDto } from './dto/create-fraud-type.dto';

@Controller('fraud-types')
export class FraudTypesController {
    constructor(private readonly fraudTypeService: FraudTypeService) {}

    @Post()
    create(@Body() CreateFraudTypeDto: CreateFraudTypeDto) {
        return this.fraudTypeService.create(CreateFraudTypeDto);
    }

    @Get()
    findAll() {
        return this.fraudTypeService.findAll();
    }

@Get()
findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fraudTypeService.findOne(id);
    }
}