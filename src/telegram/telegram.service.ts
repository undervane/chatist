import { Injectable, HttpService } from '@nestjs/common';

const BASE_PATH = 'https://api.telegram.org';

@Injectable()
export class TelegramService {

  constructor(
    private readonly http: HttpService,
  ) { }

  sendMessage(destination: { token: string, chatId: string }, text: string) {
    return this.http.get(
      BASE_PATH + '/' + destination.token + '/sendMessage',
      { params: { chat_id: destination.chatId, text } },
    );
  }

}
