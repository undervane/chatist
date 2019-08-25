import { Message } from './entity/message.entity';
import { ChatGateway } from './chat.gateway';
import { Client } from './entity/client.entity';
import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly chatGateway: ChatGateway,
  ) { }

  async update(update: any) {

    this.chatGateway.sendMessage('response', update);

    if (update && update.message.reply_to_message) {

      const message = await this.messageRepository.findOne(
        { messageId: update.message.reply_to_message.message_id },
      );

      if (message) {
        this.chatGateway.sendMessage('response', update.message.text, message.socketId);
      }

    }
  }

}
