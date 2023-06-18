import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UsersModule } from '../users/users.module';
import { CollabSessionModule } from '../collab-session/collab-session.module';
import { RoomStateService } from './cache/room-state.service';
import { AuthorityService } from './cache/authority.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [],
  providers: [SocketGateway, RoomStateService, AuthorityService],
  imports: [UsersModule, CollabSessionModule, CacheModule.register()],
  exports: [AuthorityService],
})
export class SocketModule {}
