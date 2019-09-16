import { Injectable, HttpService, Inject, forwardRef, OnModuleInit, Logger } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ConfigService } from 'nestjs-config';
import { first } from 'rxjs/operators';

const BASE_PATH = 'https://api.telegram.org';

@Injectable()
export class TelegramService implements OnModuleInit {

  config = this.configService.get('telegram');

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
    @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService,
  ) { }

  onModuleInit() {
    this.updateBotWebhook();
  }

  sendMessage(text: string) {
    return this.http.get(
      BASE_PATH + '/' + this.config.token + '/sendMessage',
      { params: { chat_id: this.config.chatId, text } },
    );
  }

  update(body: unknown) {
    this.chatService.onTelegramMessage(body);
  }

  private updateBotWebhook() {
    const webhook = this.config.webhook;

    if (!webhook) {
      return;
    }

    this.http.get(
      BASE_PATH + '/' + this.config.token + '/setWebhook',
      { params: { url: webhook } },
    )
      .pipe(
        first(),
      )
      .subscribe(
        response => Logger.log(response.data.description, 'TelegramService'),
        error => Logger.error(error.response.data.description, null, 'TelegramService'),
      );
  }

}
