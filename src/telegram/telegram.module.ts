import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [HttpModule, forwardRef(() => ChatModule)],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule { }
