import { Injectable, HttpService, Inject, forwardRef, OnModuleInit, Logger } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ConfigService } from 'nestjs-config';
import { first } from 'rxjs/operators';
import { Update } from 'node-telegram-bot-api';

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

  update(update: Update) {

    if (!update || !update.message) {
      return;
    }

    const message = update.message;

    const messageFromChatReply =
      message.reply_to_message;

    const isCommand =
      message.entities && message.entities.length !== 0 && message.entities[0].type === 'bot_command';

    if (messageFromChatReply) {
      this.chatService.onTelegramMessage(message);
      return;
    }

    if (isCommand) {
      const command = this.parseCommand(message.text);

      if (!command) {
        return;
      }

      this.handleCommand(command);
    }

  }

  private handleCommand(command: TelegramCommand) {
    switch (command.name) {
      case 'dnd':

        const noArgs = command.args.length === 0;

        if (noArgs) {
          const currentMode = this.chatService.dndMode;
          const message = `DND (Do Not Disturb) mode is currently ${currentMode.activated ? 'enabled' : 'disabled'}.
          Setup hours range from ${currentMode.startHour} to ${currentMode.endHour}`;
          this.sendMessage(message).pipe(first()).subscribe();
          return;
        }

        const activationArg = command.args.length === 1 && command.args[0] === 'enable' || command.args[0] === 'disable';

        if (activationArg) {
          let currentMode = this.chatService.dndMode;
          const enable = command.args[0] === 'enable';
          currentMode = this.chatService.setupDndMode(enable, currentMode.startHour, currentMode.endHour);

          const message = `DND (Do Not Disturb) mode is currently ${currentMode.activated ? 'enabled' : 'disabled'}.
          Setup hours range from ${currentMode.startHour} to ${currentMode.endHour}`;
          this.sendMessage(message).pipe(first()).subscribe();
          return;
        }

        const notValidArgs = command.args.length < 2;

        if (notValidArgs) {
          this.sendMessage(
            // tslint:disable trailing-comma no-trailing-whitespace
            `Not valid arguments, please provide a valid command like this: /dnd 20 12`
            // tslint:enable trailing-comma no-trailing-whitespace
          ).pipe(
            first(),
          ).subscribe();
          return;
        }

        // tslint:disable-next-line: radix
        const startHour = parseInt(command.args[0]);
        // tslint:disable-next-line: radix
        const endHour = parseInt(command.args[1]);
        this.chatService.setupDndMode(true, startHour, endHour);
        break;

      case 'ban':
        const ipToBan = command.args[0];

        this.chatService.addBannedClient(ipToBan);
        break;

      case 'banned':
        this.chatService.getBannedIPs().then((banned) =>
          this.sendMessage(
            JSON.stringify(banned),
          )
            .pipe(
              first(),
            )
            .subscribe(),
        );
        break;

      case 'unban':

        const ipToUnban = command.args[0];
        this.chatService.removeBannedIp(ipToUnban);

        break;
    }
  }

  private parseCommand(command: string): TelegramCommand {
    const commandMatch = command.match(/^\/([^@\s]+)@?(?:(\S+)|)\s?(.*)$/i);

    if (commandMatch.length === 0) {
      return;
    }

    return {
      name: commandMatch[1],
      args: commandMatch[3] ?
        commandMatch[3].split(' ') : [],
    };

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

interface TelegramCommand {
  name: string;
  args: string[];
}
