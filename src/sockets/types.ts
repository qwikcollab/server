import { Update } from '@codemirror/collab';
import { Text } from '@codemirror/state';
import { CursorPreferences } from '../users/types';

export interface JoinRoomMessage {
  roomId: string;
  name: string;
  userId: string;
}

export interface RoomUser extends JoinRoomMessage {
  userId: string;
  picture?: string;
  preferences?: CursorPreferences;
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
  users: RoomUser[];
  doc: Text;
  updates: Update[];
  lang: string;
  sessionName: string;
}
