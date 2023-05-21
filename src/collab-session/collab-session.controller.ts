import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CollabSession, User } from '@prisma/client';
import { USER } from '../decorators';
import { CollabSessionService } from './collab-session.service';

@Controller('collab-sessions')
export class CollabSessionController {
  constructor(private collabSessionService: CollabSessionService) {}

  @Post()
  async create(
    @USER() user: User,
    @Body() body: { lang: string },
  ): Promise<CollabSession> {
    return this.collabSessionService.create(user, body.lang);
  }

  @Get()
  async index(@USER() user: User): Promise<CollabSession[]> {
    return this.collabSessionService.index(user.id);
  }

  @Get(':id')
  async find(@Param('id') id: string): Promise<CollabSession> {
    return this.collabSessionService.find(id);
  }
}
