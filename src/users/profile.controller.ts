import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { EMAIL } from '../decorators';

@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async find(@EMAIL() email) {
    return await this.usersService.findByEmail(email);
  }
}
