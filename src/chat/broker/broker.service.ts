import { Message } from '../entity/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class BrokerService {

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) { }

  async addMessage(socketId: string, message: any) {
    this.messageRepository.insert(
      {
        socketId,
        messageId: message.data.result.message_id,
        message: message.data.result.text,
      },
    );
  }
}
