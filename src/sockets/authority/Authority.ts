import { ChangeSet, Text } from '@codemirror/state';
import { EditorChangesMessage, RoomData } from '../types';
import { Server } from 'socket.io';

export class Authority {
  static _data: { [roomId: string]: RoomData } = {};

  public static pushUpdates(changes: EditorChangesMessage, io: Server) {
    // Send to room
    io.to(changes.roomId).emit('updateFromServer', {
      version: changes.version,
      updates: changes.updates,
      head: changes.head,
      userId: changes.userId,
    });
  }

  public static pullUpdatesAnsSyncWithClient(
    changes: EditorChangesMessage,
    io: Server,
  ) {
    const existingUpdates = this.getUpdates(changes.roomId);

    if (changes.version !== existingUpdates.length) {
      console.log(changes.version, existingUpdates.length, 'version mismatch');
      return;
    } else {
      console.log('match', existingUpdates);
      changes.updates.forEach((u) => {
        if (!u.serializedUpdates) {
          return;
        }
        const deserializedUpdate = ChangeSet.fromJSON(u.serializedUpdates);
        this.applyUpdate(changes.roomId, deserializedUpdate, u.clientID);
      });
      this.pushUpdates(changes, io);
    }
  }

  public static getRoomData(roomId: string): RoomData {
    this._data[roomId] = this._data[roomId] ?? {
      updates: [],
      doc: Text.of(['hello world']),
    };

    return this._data[roomId];
  }

  private static getUpdates(roomId: string) {
    const data = this.getRoomData(roomId);
    return data.updates;
  }

  private static applyUpdate(
    roomId: string,
    changeSet: ChangeSet,
    clientId: string,
  ) {
    console.log(roomId, 'room id');
    const data = this.getRoomData(roomId);
    data.updates.push({
      changes: changeSet,
      clientID: clientId,
    });
    data.doc = changeSet.apply(data.doc);
  }
}
