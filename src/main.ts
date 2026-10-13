import './load-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { networkInterfaces } from 'node:os';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY));
  }

  const config = new DocumentBuilder()
    .setTitle('API Sistema de Reportes y Roles')
    .setDescription('API REST para la gestión de usuarios, roles y reportes.')
    .setVersion('1.0')
    .addServer(process.env.SWAGGER_SERVER_URL ?? '/')
    .addBearerAuth()
    .build();

  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER === '1') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`API en http://localhost:${port} y en ` + lanUrls(port).join(', '));
}

function lanUrls(port: number): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => `http://${i!.address}:${port}`);
}

bootstrap();