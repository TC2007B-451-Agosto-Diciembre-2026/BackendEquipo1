import './load-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY));
  }

  
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const config = new DocumentBuilder()
    .setTitle('API Sistema de Reportes y Roles')
    .setDescription('API REST para la gestión de usuarios, roles y reportes.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log('API en http://localhost:3000 y en ' + lanUrls().join(', '));
}

function lanUrls(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => 'http://' + i!.address + ':3000');
}

bootstrap();