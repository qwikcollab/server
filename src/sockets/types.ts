import { Update } from '@codemirror/collab';
import { Text } from '@codemirror/state';

export interface JoinRoomMessage {
  roomId: string;
  name: string;
  userId: string;
}

export interface User extends JoinRoomMessage {
  userId: string;
}

export interface CursorPosition {
  head: number;
  anchor?: number;
}

export interface EditorChangesMessage extends CursorPosition {
  version: number;
  userId: string;
  updates: {
    serializedUpdates: JSON;
    clientID: string;
  }[];
  roomId: string;
}

export interface RoomData {
  updates: Update[];
  doc: Text;
}

export interface ExistingState {
  users: User[];
  doc: Text;
  updates: Update[];
}
