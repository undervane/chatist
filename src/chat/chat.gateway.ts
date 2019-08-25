import { BrokerService } from './broker/broker.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entity/client.entity';
import { Repository } from 'typeorm';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TelegramService } from 'src/telegram/telegram.service';
import { first } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { ConfigService } from 'nestjs-config';

@WebSocketGateway(
  // tslint:disable-next-line: radix
  parseInt(process.env.WSS_PORT) || 4783,
)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly telegramService: TelegramService,
    private readonly brokerService: BrokerService,
    private readonly configService: ConfigService,

  ) { }

  @WebSocketServer() private server: Server;

  destination = this.configService.get('telegram');

  async handleConnection(socket: Socket) {

    const name = socket.handshake.query.name;

    if (isNullOrUndefined(name)) {
      socket.disconnect();
      return;
    }

    const client = { socketId: socket.id, name } as Client;

    try {
      await this.clientRepository.insert(client);
      this.telegramService
        .sendMessage(this.destination, client.name + ': [New connection ' + socket.id + ']')
        .pipe(
          first(),
        )
        .subscribe(
          message => this.brokerService.addMessage(socket.id, message),
        );
    } catch (e) {
      // Manage exception
    }
  }

  async handleDisconnect(socket: Socket) {

    const client = await this.clientRepository.findOne({ socketId: socket.id });

    if (!client) {
      // Not existing
      return;
    }

    this.clientRepository.remove(client).then(() => {

      this.telegramService
        .sendMessage(this.destination, 'Disconnect: ' + socket.id)
        .pipe(
          first(),
        )
        .subscribe();

    }).catch(e => undefined);

  }

  @SubscribeMessage('message')
  async onMessage(socket: Socket, message: string) {

    await this.clientRepository.findOne({ socketId: socket.id });

    this.telegramService.sendMessage(this.destination, message)
      .pipe(
        first(),
      )
      .subscribe(
        response => this.brokerService.addMessage(socket.id, response),
      );

    this.parseMessage(socket, message);
  }

  sendMessage(channel: string, message: string, id?: string) {
    id ? this.server.to(id).emit(channel, message) : this.server.emit(channel, message);
  }

  sendSmartReply(type: 'text' | 'md', message: string, id?: string) {

    const smartReply = {
      type,
      message,
    };

    id ? this.server.to(id).emit('smartReply', smartReply) : this.server.emit('smartReply', smartReply);
  }

  parseMessage(origin, message: string) {
    const parsed = message.match(/^\/([^@\s]+)\s?(.*)$/i);
    const command = parsed[1];

    if (command === 'hello') {
      this.sendMessage('response', 'Options', origin.id);
    }

    if (command === 'contact') {

      const markdown = `
        # Contact

        ## Email

        sergio@mipigu.com

        ## Website

        https://mipigu.com
      `;

      this.sendSmartReply('md', markdown, origin.id);
    }
  }

}
