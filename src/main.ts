import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {

  let app: INestApplication;

  if (process.env.SSL_MODE) {

    const key = fs.readFileSync(path.resolve(__dirname, process.env.SSL_KEY_PATH));
    const cert = fs.readFileSync(path.resolve(__dirname, process.env.SSL_CERT_PATH));
    const ca = fs.readFileSync(path.resolve(__dirname, process.env.SSL_CA_PATH));

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
  await app.listen(process.env.APP_PORT || 8080, process.env.APP_HOST || '0.0.0.0');
}
bootstrap();
