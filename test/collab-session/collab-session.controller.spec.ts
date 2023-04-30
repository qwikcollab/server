import { Test, TestingModule } from '@nestjs/testing';
import { CollabSessionController } from '../../src/collab-session/collab-session.controller';

describe('CodeSessionController', () => {
  let controller: CollabSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollabSessionController],
    }).compile();

    controller = module.get<CollabSessionController>(CollabSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
