import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ExistingState } from './types';
import { Server, Socket } from 'socket.io';
import { SocketSessionState } from './states/SocketSessionState';
import { UsersService } from '../users/users.service';
import { CursorPreferences } from '../users/types';
import { CollabSessionService } from '../collab-session/collab-session.service';
import { RoomStateService } from './room-state.service';
import { AuthorityService } from './authority.service';

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
    socket.on('disconnecting', async () => {
      const userId = SocketSessionState.userMap[socket.id];
      const rooms = Array.from(socket.rooms);
      await Promise.all(
        rooms.map(async (roomId: string) => {
          await this.roomStateService.removeUser(roomId, userId);
          socket.broadcast.to(roomId).emit('user-left', userId);
        }),
      );
      delete SocketSessionState.userMap[socket.id];
    });
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`socket id ${socket.id} disconnected`);
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

    const user = await this.usersService.findOne(userId);
    const userJoinedMessage = {
      userId,
      roomId,
      name: user.name,
      picture: user.picture,
      preferences: user.preferences as unknown as CursorPreferences,
    };

    SocketSessionState.userMap[socket.id] = userId;
    await this.roomStateService.addUser(userJoinedMessage);

    socket.join(msg.roomId);

    const info = await this.authorityService.getRoomData(msg.roomId);
    const existingState: ExistingState = {
      users: await this.roomStateService.getUsers(msg.roomId),
      updates: info.updates,
      doc: info.doc,
    };

    console.log('new user', existingState.doc);
    socket.to(msg.roomId).emit('user-joined', userJoinedMessage);
    this.collabSessionService.firstOrCreateUserJoinedCollabSession(
      user.id,
      roomId,
    );
    return existingState;
  }

  @SubscribeMessage('updateFromClient')
  async updateFromClient(
    @MessageBody() msg: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const { version, updates, head } = msg;
    const room = Array.from(socket.rooms).find((id) => id.length === 36);
    if (!room) {
      return;
    }
    const userId = SocketSessionState.userMap[socket.id] ?? ''; // TODO error-handling for ''
    this.authorityService.pullUpdatesAnsSyncWithClient(
      {
        version,
        updates,
        roomId: room,
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
    const { version, roomId, userId, name } = msg;
    const user = { userId, roomId, name };
    SocketSessionState.userMap[socket.id] = userId;
    await this.roomStateService.addUser(user);
    socket.join(roomId);

    // send to everyone except sender
    socket.to(roomId).emit('user-joined', user);

    const { updates } = await this.authorityService.getRoomData(roomId);
    return updates.slice(version, updates.length).map((u) => {
      return {
        serializedUpdates: u.changes.toJSON(),
        clientId: u.clientID,
      };
    });
  }

  @SubscribeMessage('positionUpdateFromClient')
  async positionUpdateFromClient(
    @MessageBody() msg: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const { head, anchor, userId } = msg;
    const room = Array.from(socket.rooms).find((id) => id.length === 36);
    if (!room) {
      return;
    }
    socket.to(room).emit('positionUpdateFromServer', {
      socketId: socket.id,
      head,
      anchor,
      userId,
    });
  }
}
