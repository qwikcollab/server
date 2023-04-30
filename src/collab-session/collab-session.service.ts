import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class CollabSessionService {
  constructor(private prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async create(creator: User) {
    return this.prisma.collabSession.create({
      data: {
        creatorId: creator.id,
        name: 'New Session',
      },
    });
  }
}
