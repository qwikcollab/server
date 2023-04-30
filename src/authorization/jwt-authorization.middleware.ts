import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
const jwtsalt = process.env.JWT_SALT;

@Injectable()
export class JwtAuthorizationMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(400);
    }

    try {
      const decoded = jwt.verify(token, jwtsalt, { complete: true });
      if (!decoded?.payload) {
        return res.status(401);
      }

      const payload = decoded.payload as JwtPayload;
      req.email = payload.email;
      req.user = await this.usersService.findByEmail(payload.email);

      console.log('going to next');
      return next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return res.status(401);
      }

      console.error(err);
      return res.status(500);
    }
  }
}
