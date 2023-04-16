import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  public async verifyGoogleToken(token: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      return { payload: ticket.getPayload() };
    } catch (error) {
      return { error: 'Invalid user detected. Please try again' };
    }
  }

  public getJwtToken(user: User) {
    return jwt.sign({ email: user.email }, process.env.JWT_SALT, {
      expiresIn: '1h',
    });
  }
}
