import { Inject, Injectable } from '@nestjs/common';
import { EditorChangesMessage, RoomData } from '../types';
import { Server } from 'socket.io';
import { ChangeSet, Text } from '@codemirror/state';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CollabSessionService } from '../../collab-session/collab-session.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class AuthorityService {
  /**
   * The interval at which the database is updated with the latest changes from the cache.
   * @private
   */
  private DB_REFRESH_INTERVAL = -1;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private collabSessionService: CollabSessionService,
  ) {}

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

    if (changes.version < existingUpdates.length) {
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
    if (!roomId) {
      console.error('Empty room id passed');
      Sentry.captureException('Empty room id passed');
      return;
    }
    let data = await this.cache.get<RoomData>(`${roomId}-docData`);
    if (!data) {
      const sessionData = await this.collabSessionService.find(roomId);
      const lines = sessionData.text.split('\n');
      data = {
        doc: Text.of(lines),
        updates: [],
      };
      // read through cache
      await this.setDocData(roomId, data);
    }
    return data;
  }

  public async getRoomDebugData(roomId: string): Promise<any> {
    const data = await this.getRoomData(roomId);
    return {
      length: data.doc.length,
      doc: data.doc,
      updates: data.updates,
    };
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
    const oldLength = data.doc.length;
    try {
      data.doc = changeSet.apply(data.doc);
    } catch (err) {
      console.error({
        oldLength,
        newLength: data.doc.length,
        changeSet: changeSet,
      });
      Sentry.captureException(err);
    }

    data.updates.push({
      changes: changeSet,
      clientID: clientId,
    });
    await this.setDocData(roomId, data);
  }

  private async setDocData(roomId: string, data: RoomData) {
    await this.cache.set(`${roomId}-docData`, data, 0);
    // TODO: add event
    await this.persistUpdates(roomId, data);
  }

  public async clearRoomDocData(roomId: string) {
    const data = await this.getRoomData(roomId);
    await this.persistUpdates(roomId, data, true);
    await this.cache.del(`${roomId}-docData`);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private async persistUpdates(roomId: string, data: RoomData, force = false) {
    const key = `${roomId}-docData-persisted`;
    const wasPersistedRecently = await this.cache.get<boolean>(key);
    if (wasPersistedRecently && !force) {
      return;
    }

    await this.collabSessionService.updateSessionText(
      roomId,
      data.doc.toString(),
    );
    await this.cache.set(key, true, this.DB_REFRESH_INTERVAL);
  }
}
