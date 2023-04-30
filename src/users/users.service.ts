import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async firstOrCreate(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        email: createUserDto.email,
      },
      update: {},
      create: {
        email: createUserDto.email,
        name: createUserDto.name,
        picture: createUserDto.picture,
        preferences: createUserDto.preferences as Prisma.JsonObject,
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    return this.prisma.user.findFirst({
      where: { id: id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: email },
    });
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
