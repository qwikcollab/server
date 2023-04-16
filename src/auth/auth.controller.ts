import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  public async register(@Body() body: { credential: string }) {
    const credential = body?.credential;
    const data = await this.authService.verifyGoogleToken(credential);
    if (data.payload) {
      const { email, picture, name } = data.payload;
      return this.usersService.firstOrCreate({ email, name, picture });
    }
    return data;
  }
}
