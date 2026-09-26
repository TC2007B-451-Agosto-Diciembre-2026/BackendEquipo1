import { IsIn, 
    IsNotEmpty, 
    IsOptional, 
    IsString, 
    IsUrl } 
    from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReporteDto {
    @ApiProperty({ description: 'Titulo del reporte', example: 'Transaccion exitosa' })
    @IsString()
    @IsNotEmpty()
    title: string | undefined;

    @ApiProperty({ description: 'Enlace a la evidencia', example: 'https://evidencia.com/comprobante.pdf' })
    @IsNotEmpty()
    @IsUrl()
    evidenceUrl?: string;

    @ApiPropertyOptional({ description: 'Deescipcion detallada' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Estado inicial',
        enum: ['En revision', 'Fraude', 'Confiable'],
        example: 'En revision'
    })
    @IsOptional()
    @IsString()
    @IsIn(['En revision', 'Fraude', 'Confiable'])
    status?: string;
}