import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { CategoriesRepository } from "./category.repository"; 
import { CreateCategoryDto } from "./dto/create-category.dto";
import { categoryEntity } from "./entities/category.entity";
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService { 
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

     async create(createFraudTypeDto: CreateCategoryDto):Promise<categoryEntity> {
        const id = await this.categoriesRepository.create(createFraudTypeDto.name);
        return {
            category_id: id,
            name: createFraudTypeDto.name,
        };
     }

     async findAll(): Promise<categoryEntity[]> {
        return this.categoriesRepository.findAll();
     }

     async findOne(id:number): Promise<categoryEntity> {
        const item = await this.categoriesRepository.findById(id);
        if(!item) {
            throw new NotFoundException(`Tipo de fraude con ID ${id} no encontrado`);
        }
        return item;
     }
     
     async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);
    if (!dto.name) {
      throw new BadRequestException('Se requiere el campo name para actualizar');
    }
    await this.categoriesRepository.update(id, dto.name);
    return { message: 'Categoría actualizada con éxito' };
  }

  async remove(id: number) {
    await this.findOne(id);

    const reportsCount = await this.categoriesRepository.countReportsWithCategory(id);
    if (reportsCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque está asociada a ${reportsCount} reporte(s)`,
      );
    }
    await this.categoriesRepository.delete(id);
    return { message: 'Categoría eliminada con éxito' };
  }
}
