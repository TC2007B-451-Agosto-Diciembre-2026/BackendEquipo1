import { Injectable, NotFoundException } from '@nestjs/common';
import { ReporteRepository } from './reporte.repository';
import { ReportResponseDto } from './dto/reporte-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Report } from './entities/reporte-entity';
import { userInfo } from 'os';

@Injectable()
export class ReportsService {
    constructor(private readonly repository: ReporteRepository) {}
    async create(sub: string, data: CreateReporteDto): Promise<ReportResponseDto> {
      const report = await this.repository.save(sub, {
        title: data.title,
        evidenceUrl: data.evidenceUrl,
        description: data.description,
        status: 'En Revision',
        });
        return ReportResponseDto.fromEntity(report);
    }

    async findAll(userId: string): Promise<ReportResponseDto[]> {
        const reports = await this.repository.findAll(userId);
        return reports.map((r) => ReportResponseDto.fromEntity(r));
    }

    async findOne(id: string): Promise<ReportResponseDto> {
        const report = await this.repository.findById(id);
        if (!report) {
            throw new NotFoundException(`Reporte ${id} no encontrado`);
        }
        return ReportResponseDto.fromEntity(report);
    }

    async update(
        id: string,
        ownerId: string,
        changes: UpdateReporteDto,
    ): Promise<ReportResponseDto> {
        const report = await this.repository.findById(id, ownerId);
        if (!report) {
            throw new NotFoundException(`Reporte ${id} con encontrado`);
        }
        
        const updated = await this.repository.update(id, ownerId, changes);
        return ReportResponseDto.fromEntity(updated!);
    }

    async remove(id: string, ownerId: string): Promise<void> {
        const report = await this.repository.findById(id, ownerId);
        if (!report) {
            throw new NotFoundException(`Reporte ${id} no encontrado`);
        }
        await this.repository.delete(id, ownerId);
    }
    
}