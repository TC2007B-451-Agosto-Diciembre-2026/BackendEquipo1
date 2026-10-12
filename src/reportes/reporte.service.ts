import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { ReporteRepository } from './reporte.repository';

@Injectable()
export class ReporteService {
  constructor(private readonly repository: ReporteRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findMyReports(userId: number) {
    return this.repository.findByUserId(userId);
  }

  async findOne(id: number) {
    const report = await this.repository.findById(id);
    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    return report;
  }

  async create(userId: number, dto: CreateReporteDto) {
    return this.repository.save(userId, dto);
  }

  async uploadImage(id: number, userId: number, file: Express.Multer.File) {
    const report = await this.findOne(id);

    if (report.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para subir imagen a este reporte');
    }

    const imageUrl = `/uploads/${file.filename}`;
    const evidenceId = await this.repository.addEvidence(id, 'image', imageUrl);
    return {
      message: 'Imagen adjuntada al reporte con éxito',
      evidenceId,
      imageUrl,
    };
  }

  async update(id: number, userId: number, dto: UpdateReporteDto) {
    const report = await this.findOne(id);

    if (report.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este reporte');
    }

    if (
      dto.categoryId === undefined &&
      !dto.caseType &&
      !dto.title &&
      !dto.description
    ) {
      throw new BadRequestException('Se requiere al menos un campo para actualizar');
    }

    await this.repository.update(id, dto);
    return { message: 'Reporte actualizado con éxito' };
  }

  async changeStatus(id: number, adminId: number, dto: ChangeStatusDto) {
    await this.findOne(id);
    await this.repository.updateStatus(
      id,
      adminId,
      dto.statusId,
      dto.fraudProbability,
    );
    return { message: 'Estado y revisión del reporte actualizados exitosamente' };
  }

  async remove(id: number, userId: number, userRoleId: number) {
    const report = await this.findOne(id);

    if (report.userId !== userId && userRoleId !== 1) {
      throw new ForbiddenException('No tienes permiso para eliminar este reporte');
    }

    await this.repository.softDelete(id);
    return { message: 'Reporte eliminado con éxito' };
  }
}