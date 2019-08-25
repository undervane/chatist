import { Module, HttpModule } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramService],
  imports: [HttpModule],
  exports: [TelegramService],
})
export class TelegramModule { }
