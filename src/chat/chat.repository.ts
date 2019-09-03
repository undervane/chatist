import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientModel } from './model/client.model';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class ChatRepository implements OnModuleInit {

  private client: Redis;

  constructor(
    private readonly redisService: RedisService,
  ) { }

  async onModuleInit() {
    this.client = await this.redisService.getClient();
  }

  async getSocketId(messageId: string): Promise<string> {
    return this.client.get(messageId);
  }

  async getClient(clientId: string): Promise<ClientModel> {

    const client = await this.client.get(clientId);

    return client ? JSON.parse(client) : null;
  }

  async addClient(clientId: string, messageId: string, name: string): Promise<boolean> {

    let client = await this.getClient(clientId);

    if (client) {
      return false;
    }

    client = { name, messages: [] } as ClientModel;

    this.client.set(clientId, JSON.stringify(client));
    return this.addMessage(clientId, messageId);

  }

  async addMessage(clientId: string, messageId: string): Promise<boolean> {

    const client = await this.getClient(clientId);

    if (!client) {
      return false;
    }

    client.messages.push(messageId);

    this.client.set(messageId, clientId);
    this.client.set(clientId, JSON.stringify(client));

    return true;
  }

  async deleteMessages(clientId: string): Promise<boolean> {

    const client = await this.getClient(clientId);

    if (!client) {
      return false;
    }

    await this.client.del(...client.messages);
    await this.client.del(clientId);

    return true;

  }

}
