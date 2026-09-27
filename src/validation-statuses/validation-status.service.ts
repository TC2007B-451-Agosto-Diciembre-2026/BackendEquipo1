import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateValidationStatusDto } from './dto/create-validation-status.dto';
import { UpdateValidationStatusDto } from './dto/update-validation-status.dto';
import { ValidationStatusesRepository } from './validation-status.repository';

@Injectable()
export class ValidationStatusesService {
  constructor(private readonly repository: ValidationStatusesRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    const status = await this.repository.findById(id);
    if (!status) {
      throw new NotFoundException(`Estado de validación con ID ${id} no encontrado`);
    }
    return status;
  }

  async create(dto: CreateValidationStatusDto) {
    return this.repository.save(dto.name);
  }

  async update(id: number, dto: UpdateValidationStatusDto) {
    await this.findOne(id);
    if (!dto.name) {
      throw new BadRequestException('Se requiere el campo name para actualizar');
    }
    await this.repository.update(id, dto.name);
    return { message: 'Estado de validación actualizado con éxito' };
  }

  async remove(id: number) {
    await this.findOne(id);

    const reportsCount = await this.repository.countReportsWithStatus(id);
    if (reportsCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el estado porque está asociado a ${reportsCount} reporte(s)`,
      );
    }

    await this.repository.delete(id);
    return { message: 'Estado de validación eliminado con éxito' };
  }
}