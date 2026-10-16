import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { isValidEvidenceSignature, signedEvidenceUrl } from './evidence-url';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { ReporteRepository } from './reporte.repository';
import { Report } from './entities/reporte-entity';
import { Role } from '../auth/roles.enum';

@Injectable()
export class ReporteService {
  constructor(private readonly repository: ReporteRepository) {}

  async findAll(roleId: number) {
    if (roleId === Role.ADMIN) {
      const reports = await this.repository.findAll();
      return Promise.all(reports.map((report) => this.addImageUrl(report)));
    }
    return this.findPublic();
  }

  async findPublic() {
    const reports = await this.repository.findApproved();
    const withImages = await Promise.all(reports.map((report) => this.addImageUrl(report)));
    return withImages.map(toPublic);
  }

  private async addImageUrl<T extends Report>(report: T) {
    const evidence = await this.repository.findEvidence(report.id);
    const image = evidence.find(
      (item) => item.evidence_type === 'image' && storedImage(item.content) !== null,
    );
    return {
      ...report,
      imageUrl: image ? signedEvidenceUrl(Number(image.evidence_id)) : null,
    };
  }

  async findPublicOne(id: number) {
    const report = await this.repository.findById(id);
    if (!report || report.deletedAt || report.statusId !== 2) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    return toPublic(report);
  }

  async findVisible(id: number, userId: number, roleId: number) {
    const report = await this.repository.findById(id);
    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    if (roleId === Role.ADMIN) {
      return report;
    }
    if (report.deletedAt) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    if (report.userId === userId) {
      return report;
    }
    if (report.statusId !== 2) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    return toPublic(report);
  }

  async findMyReports(userId: number) {
    const reports = await this.repository.findByUserId(userId);
    return Promise.all(
      reports.map((report) => this.addImageUrl(report)),
    );
  }

  async findOne(id: number) {
    const report = await this.repository.findById(id);
    if (!report || report.deletedAt) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    return report;
  }

  async create(userId: number, dto: CreateReporteDto) {
    await this.assertCategoryExists(dto.categoryId);
    return this.repository.save(userId, dto);
  }

  private async assertCategoryExists(categoryId: number) {
    if (!(await this.repository.categoryExists(categoryId))) {
      throw new BadRequestException(`La categoría ${categoryId} no existe`);
    }
  }

  async uploadImage(id: number, userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Falta el archivo en el campo "image"');
    }
    const report = await this.findOne(id);

    if (report.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para subir imagen a este reporte');
    }

    const ext = imageExtension(file.buffer);
    if (!ext) {
      throw new BadRequestException('Solo se aceptan imágenes JPG o PNG');
    }

    const key = `reports/${id}/${randomUUID()}.${ext}`;
    const path = join(UPLOAD_DIR, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.buffer);

    const evidenceId = await this.repository.addEvidence(id, 'image', key);
    return {
      message: 'Imagen adjuntada al reporte con éxito',
      evidenceId,
      url: signedEvidenceUrl(evidenceId),
    };
  }

  async findEvidence(id: number, userId: number, roleId: number) {
    const report = await this.repository.findById(id);
    const allowed =
      report && (roleId === Role.ADMIN || (!report.deletedAt && report.userId === userId));
    if (!allowed) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    const rows = await this.repository.findEvidence(id);
    return rows
      .filter((row) => row.evidence_type !== 'image' || storedImage(row.content))
      .map((row) => ({
        id: row.evidence_id,
        type: row.evidence_type,
        ...(row.evidence_type === 'image'
          ? { url: signedEvidenceUrl(row.evidence_id) }
          : { content: row.content }),
        createdAt: row.created_at,
      }));
  }

  async openEvidenceFile(evidenceId: number, exp: number, sig: string) {
    if (!isValidEvidenceSignature(evidenceId, exp, sig)) {
      return null;
    }
    const evidence = await this.repository.findEvidenceById(evidenceId);
    const image = evidence?.evidence_type === 'image' ? storedImage(evidence.content) : null;
    if (!image) {
      return null;
    }
    return {
      stream: createReadStream(image.path),
      mimeType: image.mimeType,
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
    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }

    await this.repository.update(id, dto);
    return { message: 'Reporte actualizado con éxito' };
  }

  async changeStatus(id: number, adminId: number, dto: ChangeStatusDto) {
    await this.findOne(id);
    if (!(await this.repository.statusExists(dto.statusId))) {
      throw new BadRequestException(`El estado ${dto.statusId} no existe`);
    }
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

  async findDeleted() {
    return this.repository.findDeleted();
  }

  async restore(id: number) {
    const report = await this.repository.findDeletedById(id);
    if(!report) {
      throw new NotFoundException("El reporte no está en la papelera");
    }
    await this.repository.restore(id);
    return { message: 'Reporte restaurado con éxito' };
  }
}

function toPublic(report: Report) {
  const { userId, adminId, reporterName, reporterEmail, ...rest } = report;
  return rest;
}

const UPLOAD_DIR = join(process.cwd(), 'uploads');

function storedImage(content: string): { path: string; mimeType: string } | null {
  const match = /^reports\/\d+\/[0-9a-f-]+\.(jpg|png)$/.exec(content ?? '');
  if (!match) {
    return null;
  }
  const path = join(UPLOAD_DIR, content);
  if (!existsSync(path)) {
    return null;
  }
  return { path, mimeType: match[1] === 'png' ? 'image/png' : 'image/jpeg' };
}

function imageExtension(buffer: Buffer): 'jpg' | 'png' | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length >= png.length && png.every((byte, i) => buffer[i] === byte)) {
    return 'png';
  }
  return null;
}
