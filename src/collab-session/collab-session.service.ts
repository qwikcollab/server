import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import Utils from '../utils';

@Injectable()
export class CollabSessionService {
  constructor(private prisma: PrismaService) {}

  async create(creator: User, lang: string) {
    return this.prisma.collabSession.create({
      data: {
        creatorId: creator.id,
        name: `${faker.company.name()} ${faker.name.firstName()}`,
        lang: lang,
        text: Utils.getLangDefaultCode(lang),
      },
    });
  }

  async update(user: User, { id, name }: { id: string; name: string }) {
    return this.prisma.collabSession.update({
      where: {
        id: id,
      },
      data: {
        name: name,
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
        text: text,
      },
    });
  }
}
