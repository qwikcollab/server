import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

@Injectable()
export class CollabSessionService {
  constructor(private prisma: PrismaService) {}

  async create(creator: User) {
    return this.prisma.collabSession.create({
      data: {
        creatorId: creator.id,
        name: `${faker.company.name()} ${faker.name.firstName()}`,
        text: 'console.log("hello world")',
      },
    });
  }

  async find(id: string) {
    return this.prisma.collabSession.findUnique({
      where: {
        id,
      },
    });
  }

  async index(userId: string) {
    const data = await this.prisma.userCollabSession.findMany({
      where: {
        userId: userId,
      },
      include: {
        session: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return data.map((item) => item.session);
  }

  async firstOrCreateUserJoinedCollabSession(
    userId: string,
    sessionId: string,
  ) {
    return this.prisma.userCollabSession.upsert({
      where: {
        userId_sessionId: {
          userId: userId,
          sessionId: sessionId,
        },
      },
      update: {},
      create: {
        userId: userId,
        sessionId: sessionId,
      },
    });
  }

  async updateSessionText(sessionId: string, text: string) {
    return this.prisma.collabSession.update({
      where: {
        id: sessionId,
      },
      data: {
        text: text as Prisma.JsonValue,
      },
    });
  }
}
