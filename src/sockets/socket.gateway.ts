import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ExistingState, RoomUser } from './types';
import { Server, Socket } from 'socket.io';
import { SocketSessionState } from './cache/SocketSessionState';
import { UsersService } from '../users/users.service';
import { CursorPreferences } from '../users/types';
import { CollabSessionService } from '../collab-session/collab-session.service';
import { RoomStateService } from './cache/room-state.service';
import { AuthorityService } from './cache/authority.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly usersService: UsersService,
    private readonly collabSessionService: CollabSessionService,
    private readonly roomStateService: RoomStateService,
    private readonly authorityService: AuthorityService,
  ) {
    console.log('instantiated websocket module');
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    // handle connection
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    await this.userLeaveRoom(socket);
  }

  @SubscribeMessage('join-room')
  async onJoinRoom(
    @MessageBody() msg: { userId: string; roomId: string },
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const { userId, roomId } = msg;
    const room = await this.collabSessionService.find(roomId);
    if (!room) {
      return { failed: true, message: 'Room not found' };
    }
    SocketSessionState.userMap[socket.id] = { userId, roomId };

    const user = await this.usersService.findOne(userId);
    const userJoinedMessage: RoomUser = {
      userId,
      roomId,
      name: user.name,
      picture: user.picture,
      preferences: user.preferences as unknown as CursorPreferences,
    };

    await this.roomStateService.addUser(userJoinedMessage);

    socket.join(msg.roomId);

    const info = await this.authorityService.getRoomData(msg.roomId);
    const existingState: ExistingState = {
      users: await this.roomStateService.getUsers(msg.roomId),
      updates: info.updates,
      doc: info.doc,
      lang: room.lang,
      sessionName: room.name,
    };

    socket.to(msg.roomId).emit('user-joined', userJoinedMessage);
    await this.collabSessionService.firstOrCreateUserJoinedCollabSession(
      user.id,
      roomId,
    );
    return existingState;
  }

  @SubscribeMessage('leave-room')
  async userLeft(@ConnectedSocket() socket: Socket) {
    await this.userLeaveRoom(socket);
  }

  @SubscribeMessage('updateFromClient')
  async updateFromClient(
    @MessageBody() msg: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    console.log('received update from client');
    const { version, updates, head, roomId } = msg;
    const userId = SocketSessionState.userMap[socket.id].userId ?? ''; // TODO error-handling for ''
    await this.authorityService.pullUpdatesAnsSyncWithClient(
      {
        version,
        updates,
        roomId,
        head,
        userId,
      },
      this.server,
    );
  }

  @SubscribeMessage('getPendingUpdates')
  async getPendingUpdates(
    @MessageBody() msg: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const { version, roomId, userId } = msg;

    SocketSessionState.userMap[socket.id] = { userId, roomId };
    const user = await this.usersService.findOne(userId);
    const userJoinedMessage: RoomUser = {
      userId,
      roomId,
      name: user.name,
      picture: user.picture,
      preferences: user.preferences as unknown as CursorPreferences,
    };

    await this.roomStateService.addUser(userJoinedMessage);

    socket.join(roomId);
    // send to everyone except sender
    socket.to(roomId).emit('user-joined', userJoinedMessage);

    const { updates } = await this.authorityService.getRoomData(roomId);
    const pending = updates.slice(version, updates.length).map((u) => {
      return {
        serializedUpdates: u.changes.toJSON(),
        clientId: u.clientID,
      };
    });

    return {
      updates: pending,
      users: await this.roomStateService.getUsers(msg.roomId),
    };
  }

  @SubscribeMessage('positionUpdateFromClient')
  async positionUpdateFromClient(
    @MessageBody() msg: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const { head, anchor, userId, roomId } = msg;
    socket.to(roomId).emit('positionUpdateFromServer', {
      head,
      anchor,
      userId,
    });
  }

  private async userLeaveRoom(socket: Socket) {
    const socketId = socket.id;
    const state = SocketSessionState.userMap[socketId];
    if (!state) {
      return;
    }
    if (state && !state.userId) {
      throw new Error('User id not found for' + socketId);
    }
    const { userId, roomId } = state;
    await this.roomStateService.removeUser(roomId, userId);
    this.server.to(roomId).emit('user-left', userId);
    delete SocketSessionState.userMap[socketId];
  }
}
