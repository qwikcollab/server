import { User } from './types';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RoomStateService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  public async addUser(user: User) {
    const existingUsers = await this.getUsers(user.roomId);
    const alreadyExists = existingUsers.find((u) => u.userId === user.userId);
    if (alreadyExists) {
      return;
    }
    existingUsers.push(user);
    await this.setUsers(user.roomId, existingUsers);
  }

  public async removeUser(roomId: string, userId: string | null) {
    if (!userId) {
      return;
    }
    let existingUsers = await this.getUsers(roomId);
    if (!existingUsers) {
      return;
    }
    existingUsers = existingUsers.filter((u) => u.userId !== userId);
    await this.setUsers(roomId, existingUsers);
  }

  public async getUsers(roomId: string): Promise<User[]> {
    const users = await this.cache.get<User[]>(`${roomId}-users`);
    return users ?? [];
  }

  public async setUsers(roomId: string, users: User[]) {
    await this.cache.set(`${roomId}-users`, users, 0);
  }
}