import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService,
  ) { }

  @WebSocketServer() private server: Server;

  async handleConnection(socket: Socket) {
    this.chatService.onClientConnect(socket);
  }

  async handleDisconnect(socket: Socket) {
    this.chatService.onClientDisconnect(socket);
  }

  @SubscribeMessage('message')
  async onMessage(socket: Socket, message: string) {
    this.chatService.onClientMessage(socket, message);
  }

  close(): void {
    this.server.close();
  }

  sendMessage(channel: string, message: unknown, id?: string) {
    id ? this.server.to(id).emit(channel, message) : this.server.emit(channel, message);
  }

}
