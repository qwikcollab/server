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

// run only in local
export function OnlyLocal() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    if (process.env.NODE_ENV === 'development') {
      // return the original method if the environment is development
      return descriptor;
    } else {
      // return a dummy function that does nothing otherwise
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      descriptor.value = () => {};
      return descriptor;
    }
  };
}
