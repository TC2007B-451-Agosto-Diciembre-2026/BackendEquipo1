import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { FraudTypesRepository } from "./fraud-type.repository"; 
import { CreateFraudTypeDto } from "./dto/create-fraud-type.dto";
import { fraudTypeEntity } from "./entities/fraud-type.entity";
import { UpdateFraudTypeDto } from './dto/update-fraud-type.dto';

@Injectable()
export class FraudTypesService { 
    constructor(private readonly fraudTypesRepository: FraudTypesRepository) {}

     async create(createFraudTypeDto: CreateFraudTypeDto):Promise<fraudTypeEntity> {
        const id = await this.fraudTypesRepository.create(createFraudTypeDto.name);
        return {
            fraud_type_id: id,
            name: createFraudTypeDto.name,
        };
     }

     async findAll(): Promise<fraudTypeEntity[]> {
        return this.fraudTypesRepository.findAll();
     }

     async findOne(id:number): Promise<fraudTypeEntity> {
        const item = await this.fraudTypesRepository.findById(id);
        if(!item) {
            throw new NotFoundException(`Tipo de fraude con ID ${id} no encontrado`);
        }
        return item;
     }
     
     async update(id: number, dto: UpdateFraudTypeDto) {
    await this.findOne(id);
    if (!dto.name) {
      throw new BadRequestException('Se requiere el campo name para actualizar');
    }
    await this.fraudTypesRepository.update(id, dto.name);
    return { message: 'Tipo de fraude actualizado con éxito' };
  }

  async remove(id: number) {
    await this.findOne(id);

    const reportsCount = await this.fraudTypesRepository.countReportsWithFraudType(id);
    if (reportsCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el tipo de fraude porque está asociado a ${reportsCount} reporte(s)`,
      );
    }
    await this.fraudTypesRepository.delete(id);
    return { message: 'Tipo de fraude eliminado con éxito' };
  }
}
