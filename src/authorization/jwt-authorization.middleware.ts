import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from 'jsonwebtoken';
const jwtsalt = process.env.JWT_SALT;

@Injectable()
export class JwtAuthorizationMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: any, res: any, next: () => void) {
    const token = req.headers.authorization;

    console.log('jwt tok');

    if (!token) {
      return res.status(400);
    }

    console.log('jwt step');
    const decoded = jwt.verify(token, jwtsalt, { complete: true });
    if (!decoded?.payload) {
      return res.status(401);
    }
    console.log('here');

    const payload = decoded.payload as JwtPayload;
    req.user = await this.prisma.user.findFirst({
      where: { email: payload.email },
    });

    next();
  }
}
