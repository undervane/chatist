import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { RedisModule } from 'nestjs-redis';
import * as path from 'path';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ChatModule,
    TelegramModule,
    ConfigModule.load(path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}')),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule { }
