import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// extract email from authorized request
export const EMAIL = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.email; // extract email from request
  },
);

// extract user from authorized request
export const USER = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // extract email from request
  },
);
