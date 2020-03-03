import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from 'nestjs-config';

async function bootstrap() {

  let app: INestApplication;

  app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const appConfig = configService.get('app');

  if (appConfig.sslMode === '1') {

    const key = fs.readFileSync(path.resolve(appConfig.sslKeyPath));
    const cert = fs.readFileSync(path.resolve(appConfig.sslCertPath));
    const ca = fs.readFileSync(path.resolve(appConfig.sslCaPath));

    app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key,
        cert,
        ca,
      },
    });
  }

  app.enableCors();
  await app.listen(appConfig.port || 8080);
}
bootstrap();
