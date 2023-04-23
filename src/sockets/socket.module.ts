import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [],
  providers: [SocketGateway],
  imports: [UsersModule],
})
export class SocketModule {}
