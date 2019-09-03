import { Test, TestingModule } from '@nestjs/testing';
import { ChatRepository } from './chat.repository';

describe('ChatRepository', () => {
  let service: ChatRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatRepository],
    }).compile();

    service = module.get<ChatRepository>(ChatRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
