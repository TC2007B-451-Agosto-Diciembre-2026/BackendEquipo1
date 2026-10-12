import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReporteService } from './reporte.service';

@ApiTags('reportes')
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly service: ReporteService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Descargar una imagen de evidencia con una URL firmada' })
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Query('exp') exp: string,
    @Query('sig') sig: string,
  ) {
    const file = await this.service.openEvidenceFile(id, Number(exp), sig);
    if (!file) {
      throw new NotFoundException('Evidencia no encontrada o enlace expirado');
    }
    return new StreamableFile(file.stream, {
      type: file.mimeType,
      disposition: 'inline',
    });
  }
}
