import { CursorPreferences } from '../types';

export class CreateUserDto {
  email: string;
  picture: string;
  name: string;
  preferences?: Partial<CursorPreferences>;
}
