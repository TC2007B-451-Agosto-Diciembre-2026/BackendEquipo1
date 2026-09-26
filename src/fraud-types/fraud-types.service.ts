import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { FraudTypeRepository } from "./fraud-types.repository"; 
import { CreateFraudTypeDto } from './dto/create-fraud-type.dto';
import { FraudTypeEntity } from "./entities/fraud-type.entity";
import { NotFoundError } from "rxjs";

@Injectable()
export class FraudTypeService { 
    constructor(private readonly fraudTypesRepository: FraudTypeRepository) {}

     async create(createFraudTypeDto: CreateFraudTypeDto):Promise<FraudTypeEntity> {
        const id = await this.fraudTypesRepository.create(createFraudTypeDto.name);
        return {
            fraude_type_id: id,
            name: createFraudTypeDto.name,
        };
     }

     async findAll(): Promise<FraudTypeEntity[]> {
        return this.fraudTypesRepository.findAll();
     }

     async findOne(id:number): Promise<FraudTypeEntity> {
        const item = await this.fraudTypesRepository.findById(id);
        if(!item) {
            throw new NotFoundException(`Tipo de fraude con ID ${id} no encontrado`);
        }
        return item;
     }
}
