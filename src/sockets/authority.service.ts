import { Inject, Injectable } from '@nestjs/common';
import { EditorChangesMessage, RoomData } from './types';
import { Server } from 'socket.io';
import { ChangeSet, Text } from '@codemirror/state';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthorityService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  public pushUpdates(changes: EditorChangesMessage, io: Server) {
    // Send to room
    io.to(changes.roomId).emit('updateFromServer', {
      version: changes.version,
      updates: changes.updates,
      head: changes.head,
      userId: changes.userId,
    });
  }

  public async pullUpdatesAnsSyncWithClient(
    changes: EditorChangesMessage,
    io: Server,
  ) {
    const existingUpdates = await this.getUpdates(changes.roomId);

    if (changes.version !== existingUpdates.length) {
      // TODO: handle this case
      console.log(changes.version, existingUpdates.length, 'version mismatch');
      return;
    }
    changes.updates.forEach((u) => {
      if (!u.serializedUpdates) {
        return;
      }
      const deserializedUpdate = ChangeSet.fromJSON(u.serializedUpdates);
      this.applyUpdate(changes.roomId, deserializedUpdate, u.clientID);
    });
    this.pushUpdates(changes, io);
  }

  public async getRoomData(roomId: string): Promise<RoomData> {
    let data = await this.cache.get<RoomData>(`${roomId}-docData`);
    if (!data) {
      data = {
        updates: [],
        doc: Text.of(['console.log("hello world")']),
      };
      await this.setDocData(roomId, data);
    }
    return data;
  }

  private async getUpdates(roomId: string) {
    const data = await this.getRoomData(roomId);
    return data.updates;
  }

  private async applyUpdate(
    roomId: string,
    changeSet: ChangeSet,
    clientId: string,
  ) {
    const data = await this.getRoomData(roomId);
    data.updates.push({
      changes: changeSet,
      clientID: clientId,
    });
    data.doc = changeSet.apply(data.doc);
    await this.setDocData(roomId, data);
  }

  private async setDocData(roomId: string, data: RoomData) {
    await this.cache.set(`${roomId}-docData`, data, 0);
  }
}
