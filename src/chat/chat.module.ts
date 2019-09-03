import { ChatGateway } from './chat.gateway';
import { TelegramModule } from '../telegram/telegram.module';
import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [
    forwardRef(() => TelegramModule),
  ],
  providers: [ChatService, ChatGateway, ChatRepository],
  exports: [ChatService],
})
export class ChatModule { }
