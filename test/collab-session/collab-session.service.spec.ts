import { Test, TestingModule } from '@nestjs/testing';
import { CollabSessionService } from '../../src/collab-session/collab-session.service';

describe('CollabSessionService', () => {
  let service: CollabSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollabSessionService],
    }).compile();

    service = module.get<CollabSessionService>(CollabSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
