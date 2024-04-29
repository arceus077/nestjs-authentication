import { IsString } from 'class-validator';

export class AuthDataDto {
  @IsString()
  authToken: string;

  @IsString()
  refreshToken: string;
}
