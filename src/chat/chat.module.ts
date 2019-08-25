import { Message } from './entity/message.entity';
import { ChatGateway } from './chat.gateway';
import { TelegramModule } from '../telegram/telegram.module';
import { Client } from './entity/client.entity';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrokerService } from './broker/broker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Message]),
    TelegramModule,
  ],
  providers: [ChatService, ChatGateway, BrokerService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule { }
