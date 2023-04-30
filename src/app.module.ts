import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './sockets/socket.module';
import {
  Module,
  NestModule,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';
import { JwtAuthorizationMiddleware } from './authorization/jwt-authorization.middleware';
import { CollabSessionModule } from './collab-session/collab-session.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    SocketModule,
    CollabSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthorizationMiddleware)
      .forRoutes(
        { path: 'profile', method: RequestMethod.GET },
        { path: 'collab-session', method: RequestMethod.POST },
      );
  }
}
