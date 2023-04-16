import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ExistingState, JoinRoomMessage } from './types';
import { Server, Socket } from 'socket.io';
import { SocketSessionState } from './states/SocketSessionState';
import { RoomsState } from './states/RoomState';
import { Authority } from './authority/Authority';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('new connection');
    socket.on('disconnecting', () => {
      console.log('user disconnecting');
      socket.rooms.forEach((roomId: string) => {
        const userId = SocketSessionState.userMap[socket.id];
        RoomsState.removeUser(roomId, userId);
        socket.broadcast.to(roomId).emit('user-left', userId);
      });
      delete SocketSessionState.userMap[socket.id];
    });
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('pop');
    // socket.rooms.forEach((roomId: string) => {
    //   const userId = SocketSessionState.userMap[socket.id];
    //   RoomsState.removeUser(roomId, userId);
    //   socket.broadcast.to(roomId).emit('user-left', userId);
    // });
    // delete SocketSessionState.userMap[socket.id];
  }

  @SubscribeMessage('join-room')
  async onJoinRoom(
    @MessageBody() msg: JoinRoomMessage,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const user = msg;
    SocketSessionState.userMap[socket.id] = msg.userId;
    RoomsState.addUser(user);

    socket.join(msg.roomId);

    const info = Authority.getRoomData(msg.roomId);
    const existingState: ExistingState = {
      users: RoomsState.getUsers(msg.roomId),
      updates: info.updates,
      doc: info.doc,
    };

    socket.to(msg.roomId).emit('user-joined', user);
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
    console.log('update from client ', room);
    Authority.pullUpdatesAnsSyncWithClient(
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
    RoomsState.addUser(user);
    socket.join(roomId);

    // send to everyone except sender
    socket.to(roomId).emit('user-joined', user);

    const { updates } = Authority.getRoomData(roomId);
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
