import { User } from '../types';

export class RoomsState {
  private static rooms: { [roomId: string]: User[] } = {};

  public static addUser(user: User) {
    const existingUsers = this.getUsers(user.roomId);
    const alreadyExists = existingUsers.find((u) => u.userId === user.userId);
    if (alreadyExists) {
      return;
    }
    existingUsers.push(user);
  }

  public static removeUser(roomId: string, userId: string | null) {
    if (!userId) {
      return;
    }
    const existingUsers = this.rooms[roomId];
    if (!existingUsers) {
      return;
    }
    this.rooms[roomId] = existingUsers.filter((u) => u.userId !== userId);
  }

  public static findUser(roomId: string, userId: string): User | null {
    return (
      this.getUsers(roomId)?.find((user) => user.userId === userId) ?? null
    );
  }

  public static getUsers(roomId: string): User[] {
    this.rooms[roomId] = this.rooms[roomId] ?? [];
    return this.rooms[roomId];
  }
}
