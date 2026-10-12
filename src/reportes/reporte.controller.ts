import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { ReporteService } from './reporte.service';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('reportes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reports')
export class ReporteController {
  constructor(private readonly service: ReporteService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Listar todos los reportes activos' })
  findAll() {
    return this.service.findAll();
  }

  @Get('deleted')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar los reportes en la papelera' })
  findDeleted() {
    return this.service.findDeleted();
  }

  @Get('mis-reportes')
 @ApiOperation({ summary: 'Obtener los reportes creados por el usuario' })
  findMyReports(@Req() req: any) {
    const userId = req.user.userId ?? req.user.id ?? req.user.sub;
    return this.service.findMyReports(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un reporte en especifico' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo reporte (status_id por defecto: 1)' })
  create(@Req() req: any, @Body() dto: CreateReporteDto) {
    const userId = req.user.userId ?? req.user.id ?? req.user.sub;
    return this.service.create(userId, dto);
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `report-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Adjuntar una imagen de evidencia a un reporte' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
      required: ['image'],
    },
  })
  uploadImage(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId ?? req.user.id ?? req.user.sub;
    return this.service.uploadImage(id, userId, file);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar contenido de un reporte propio' })
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReporteDto,
  ) {
   const userId = req.user.userId ?? req.user.id ?? req.user.sub;
    return this.service.update(id, userId, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Revisar reporte (asigna admin_id, status_id, fraud_probability y approved_at)' })
  changeStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto,
  ) {
    const adminId = req.user.userId ?? req.user.id ?? req.user.sub;
    return this.service.changeStatus(id, adminId, dto);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Recuperar un reporte de la papelera' })
  @Roles(Role.ADMIN)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.service.restore(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un reporte (Soft Delete)' })
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId ?? req.user.id ?? req.user.sub;
    return this.service.remove(id, userId, Number(req.user.role_id));
  }
}
