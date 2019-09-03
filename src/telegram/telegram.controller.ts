import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {

  constructor(
    private readonly telegramService: TelegramService,
  ) { }

  @Post('webhook')
  handleUpdate(@Body() body: any) {
    this.telegramService.update(body);
  }
}
