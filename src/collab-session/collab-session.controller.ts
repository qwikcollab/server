import { Controller, Post } from '@nestjs/common';
import { CollabSession, User } from '@prisma/client';
import { USER } from '../decorators';
import { CollabSessionService } from './collab-session.service';

@Controller('collab-session')
export class CollabSessionController {
  constructor(private collabSessionService: CollabSessionService) {}

  @Post()
  async create(@USER() user: User): Promise<CollabSession> {
    return await this.collabSessionService.create(user);
  }
}
