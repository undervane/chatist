import { Injectable, HttpService, Inject, forwardRef } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';

const BASE_PATH = 'https://api.telegram.org';

@Injectable()
export class TelegramService {

  constructor(
    private readonly http: HttpService,
    @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService,
  ) { }

  sendMessage(destination: { token: string, chatId: string }, text: string) {
    return this.http.get(
      BASE_PATH + '/' + destination.token + '/sendMessage',
      { params: { chat_id: destination.chatId, text } },
    );
  }

  update(body: unknown) {
    this.chatService.onTelegramMessage(body);
  }

}
