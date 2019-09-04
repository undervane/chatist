import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {

  let app: INestApplication;

  if (process.env.NODE_ENV === 'production') {

    const key = fs.readFileSync(path.resolve(__dirname, '../ssl/privkey.pem'));
    const cert = fs.readFileSync(path.resolve(__dirname, '../ssl/cert.pem'));
    const ca = fs.readFileSync(path.resolve(__dirname, '../ssl/fullchain.pem'));

    app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key,
        cert,
        ca,
      },
    });
  } else {
    app = await NestFactory.create(AppModule);
  }

  app.enableCors();
  await app.listen(process.env.APP_PORT || 3000, process.env.APP_HOST || '0.0.0.0');
}
bootstrap();
