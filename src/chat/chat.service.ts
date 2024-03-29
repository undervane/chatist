import { ChatGateway } from './chat.gateway';
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { ConfigService } from 'nestjs-config';
import { isNullOrUndefined } from 'util';
import { Socket } from 'socket.io';
import { TelegramService } from '../telegram/telegram.service';
import { first } from 'rxjs/operators';

@Injectable()
export class ChatService {

  constructor(
    private readonly chatRepository: ChatRepository,
    @Inject(forwardRef(() => ChatGateway)) private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService,
  ) { }

  onClientConnect(socket: Socket) {
    const name = socket.handshake.query.name;

    if (isNullOrUndefined(name)) {
      socket.disconnect();
      return;
    }

    try {
      this.telegramService
        .sendMessage(`New connection: ${name} (${socket.id})`)
        .pipe(
          first(),
        )
        .subscribe(
          response => this.chatRepository.addClient(socket.id, response.data.result.message_id, name),
        );
    } catch (e) {
      // Manage exception
    }
  }

  async onClientDisconnect(socket: Socket) {

    const client = await this.chatRepository.getClient(socket.id);

    this.chatRepository.deleteMessages(socket.id).then(() => {

      this.telegramService
        .sendMessage(`Disconnect: ${client.name} (${socket.id})`)
        .pipe(
          first(),
        )
        .subscribe();

    }).catch(e => undefined);
  }

  async onClientMessage(socket: Socket, message: string) {

    const client = await this.chatRepository.getClient(socket.id);

    const finalMessage = `${client.name}: ${message}`;

    this.telegramService.sendMessage(finalMessage)
      .pipe(
        first(),
      )
      .subscribe(
        response => this.chatRepository.addMessage(socket.id, response.data.result.message_id),
      );

  }

  onCommand(socket: Socket, message: string): boolean {
    const parsed = message.match(/^\/([^@\s]+)\s?(.*)$/i);

    if (!parsed || !parsed[1]) {
      return;
    }

    const command = parsed[1];

    switch (command) {
      case 'hello':
        this.chatGateway.sendMessage('response', 'Options', socket.id);
        break;

      case 'close':
        socket.disconnect();
        break;

      case 'contact':
        const markdown = `
        # Contact

        ## Email

        sergio@mipigu.com

        ## Website

        https://mipigu.com
        `;

        this.sendSmartReply('md', markdown, socket.id);
        break;

      default:
        this.chatGateway.sendMessage('response', `Oh, I don't understand what you mean with command: /${command}`, socket.id);
        break;

    }
  }

  async onTelegramMessage(update: any) {

    if (update && update.message && update.message.reply_to_message) {

      const socketId = await this.chatRepository.getSocketId(
        update.message.reply_to_message.message_id,
      );

      if (socketId) {
        this.chatGateway.sendMessage('response', update.message.text, socketId);
      }

    }
  }

  private sendSmartReply(type: 'text' | 'md', message: string, id?: string) {

    const smartReply = {
      type,
      message,
    };

    id ? this.chatGateway.sendMessage('smartReply', smartReply, id) : this.chatGateway.sendMessage('smartReply', smartReply);
  }

}
