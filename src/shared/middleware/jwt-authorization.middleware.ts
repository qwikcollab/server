import { Injectable, NestMiddleware, HttpException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '../../users/users.service';
const jwtsalt = process.env.JWT_SALT;

@Injectable()
export class JwtAuthorizationMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: any, res: any, next: any) {
    const token = req.headers.authorization;

    try {
      if (!token) {
        throw new HttpException('No token provided', 401);
      }
      const decoded = jwt.verify(token, jwtsalt, { complete: true });
      if (!decoded?.payload) {
        throw new HttpException('No token payload', 401);
      }

      const payload = decoded.payload as JwtPayload;
      req.email = payload.email;
      req.user = await this.usersService.findByEmail(payload.email);

      return next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new HttpException('Token expired', 401);
      }
      next(err);
    }
  }
}
