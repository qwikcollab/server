import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

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
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
