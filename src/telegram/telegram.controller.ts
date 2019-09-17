import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Update } from 'node-telegram-bot-api';

@Controller('telegram')
export class TelegramController {

  constructor(
    private readonly telegramService: TelegramService,
  ) { }

  @Post('webhook')
  handleUpdate(@Body() update: Update) {
    this.telegramService.update(update);
  }
}
