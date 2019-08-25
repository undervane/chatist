import { ChatService } from './chat/chat.service';
import { Controller, Post, Body } from '@nestjs/common';

@Controller()
export class AppController {

  constructor(
    private readonly chatService: ChatService,
  ) { }

  @Post()
  handleUpdate(@Body() body: any) {
    this.chatService.update(body);
  }
}
