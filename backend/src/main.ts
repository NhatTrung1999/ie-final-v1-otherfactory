import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const uploadPath =
    configService.get<string>('UPLOAD_DESTINATION') ||
    '\\192.168.0.102\\cie\\IE_VIDEO';

  if (fs.existsSync(uploadPath)) {
    app.use('/IE_VIDEO', express.static(uploadPath));
    console.log(`📂 Static IE_VIDEO served from: ${uploadPath}`);
  } else {
    console.warn(`⚠️ Upload folder not found: ${uploadPath}`);
  }
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads/',
  // });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port ?? 6868);
}
bootstrap();
