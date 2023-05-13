import { Module } from '@nestjs/common';
import { CollabSessionController } from './collab-session.controller';
import { CollabSessionService } from './collab-session.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [CollabSessionController],
  imports: [PrismaModule],
  providers: [CollabSessionService],
  exports: [CollabSessionService],
})
export class CollabSessionModule {}
