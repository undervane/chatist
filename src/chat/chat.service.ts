import { ChatGateway } from './chat.gateway';
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { ConfigService } from 'nestjs-config';
import { isNullOrUndefined } from 'util';
import { Socket } from 'socket.io';
import { TelegramService } from '../telegram/telegram.service';
import { first } from 'rxjs/operators';
import { Message } from 'node-telegram-bot-api';
import { DNDMode } from './modes/dnd.mode';

@Injectable()
export class ChatService {

  dndMode = new DNDMode();

  constructor(
    private readonly chatRepository: ChatRepository,
    @Inject(forwardRef(() => ChatGateway)) private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService,
  ) { }

  async onClientConnect(socket: Socket) {
    const name = socket.handshake.query.name;
    const ip = socket.handshake.headers['x-forwarded-for'];

    if (isNullOrUndefined(name) || await this.isBannedIp(ip)) {
      socket.disconnect();
      return;
    }

    if (this.dndMode.check()) {
      // Include away message if any
      // this.chatGateway.sendMessage('response', 'Away');
      return;
    }

    try {
      this.telegramService
        .sendMessage(`New connection: ${name} (${socket.id})`)
        .pipe(
          first(),
        )
        .subscribe(
          response => this.chatRepository.addClient(socket.id, response.data.result.message_id, name, ip),
        );
    } catch (e) {
      // Manage exception
    }
  }

  async onClientDisconnect(socket: Socket) {

    if (this.dndMode.check()) {
      return;
    }

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

    if (this.dndMode.check()) {
      // Include away message, if any
      // this.chatGateway.sendMessage('response', 'Away');
      return;
    }

    const client = await this.chatRepository.getClient(socket.id);

    if (await this.isBannedIp(client.ip)) {
      socket.disconnect();
      return;
    }

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

  async onTelegramMessage(message: Message) {

    const socketId = await this.chatRepository.getSocketId(
      message.reply_to_message.message_id.toString(),
    );

    if (socketId) {
      this.chatGateway.sendMessage('response', message.text, socketId);
    }
  }

  setupDndMode(activated: boolean, startHour: number, endHour: number) {
    this.dndMode = new DNDMode(activated, startHour, endHour);
    return this.dndMode;
  }

  getBannedIPs(): Promise<string[]> {
    return this.chatRepository.getBannedIPs();
  }

  async addBannedClient(clientId: string): Promise<void> {
    const client = await this.chatRepository.getClient(clientId);

    if (!client) {
      throw new Error('No client found');
    }

    this.chatRepository.addBanIP(client.ip);
  }

  async removeBannedIp(ip: string): Promise<void> {
    this.chatRepository.removeBanIP(ip);
  }

  async isBannedIp(ip: string): Promise<boolean> {
    const banned = await this.chatRepository.getBannedIPs();
    return banned.includes(ip);
  }

  private sendSmartReply(type: 'text' | 'md', message: string, id?: string) {

    const smartReply = {
      type,
      message,
    };

    id ? this.chatGateway.sendMessage('smartReply', smartReply, id) : this.chatGateway.sendMessage('smartReply', smartReply);
  }

}
