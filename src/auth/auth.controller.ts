import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import Utils from '../utils';
import { faker } from '@faker-js/faker';
import { OnlyLocal } from '../decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register/google')
  public async registerGoogle(@Body() body: { credential: string }) {
    const credential = body?.credential;
    const data = await this.authService.verifyGoogleToken(credential);
    if (data.payload) {
      const { email, picture, name } = data.payload;
      const randomColor = Utils.getRandomFromArray(Utils.cursorColors);
      const user = await this.usersService.firstOrCreate({
        email,
        name,
        picture,
        preferences: { color: randomColor },
      });
      return {
        token: this.authService.getJwtToken(user),
      };
    }
    return data;
  }

  @Post('register')
  @OnlyLocal()
  public async register(@Body() body: { email: string }) {
    const { email } = body;
    const user = await this.usersService.firstOrCreate({
      email,
      name: faker.name.fullName(),
      picture: faker.image.avatar(),
      preferences: { color: Utils.getRandomFromArray(Utils.cursorColors) },
    });
    return {
      token: this.authService.getJwtToken(user),
    };
  }
}
