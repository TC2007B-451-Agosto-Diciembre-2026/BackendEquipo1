import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reporte.service';
import { ReportResponseDto } from './dto/reporte-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { JwtPayload } from 'src/auth/jwt';


@ApiTags('reportes')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Sin autorizacion / Token no valido' })
@Controller('reportes')
@UseGuards(AuthGuard)
export class ReportsController {
    constructor(private readonly service: ReportsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un reporte' })
    @ApiResponse({ status: 201, description: 'Reporte creado', type: ReportResponseDto })
    @ApiResponse(({ status: 400, description: 'Datos invalidos' }))
    create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateReporteDto, 
    ): Promise<ReportResponseDto> {
        return this.service.create(user.sub, dto);
    }

    @Post('upload-evidence')
  @ApiOperation({ summary: 'Sube un archivo de evidencia al servidor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Regresa la dirección del archivo guardado' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => cb(null, file.originalname),
      }),
    }),
  )
  uploadEvidence(@UploadedFile() file: { originalname: string }) {
    if (!file) {
      throw new BadRequestException('No vino ningún archivo');
    }
    
    return {
      evidenceUrl: '/uploads/' + file.originalname,
    };
  }
    @Get()
    @ApiOperation({ summary: 'Listar reportes del usuario autenticado' })
    @ApiResponse({ status: 200, description: 'Lista de reportes', type: [ReportResponseDto] })
    findAll(@CurrentUser() user: JwtPayload): Promise<ReportResponseDto[]> {
        return this.service.findAll(user.sub);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un reporte por Id' })
    @ApiResponse({ status: 200, description: 'Reporte encontrado', type: ReportResponseDto })
    @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
    findOne(@Param('id') id: string): Promise<ReportResponseDto> {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Editar un reporte' })
    @ApiResponse({ status: 200, description: 'Reporte actualizado', type: ReportResponseDto })
    @ApiResponse({ status: 400, description: 'Datos invalidos' })
    @ApiResponse({ status: 404, description: 'Reporte no encontrado o sin permisos' })
    update(
        @CurrentUser() user: JwtPayload,
        @Param('id') id: string,
        @Body() dto: UpdateReporteDto,
    ): Promise<ReportResponseDto> {
        return this.service.update(id, user.sub, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Borrar un reporte' })
    @ApiResponse({ status: 204, description: 'Reporte borrado exitosamente' })
    @ApiResponse({ status: 404, description: 'Reporte no encontrado o sin permisos' })
    remove(
        @CurrentUser() user: JwtPayload,
        @Param('id') id: string): Promise<void> {
        return this.service.remove(id, user.sub);
    }

}
