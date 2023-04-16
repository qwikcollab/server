import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('profile')
export class ProfileController {
  @Get()
  find(@Req() request: Request) {
    return request.user;
  }
}
