import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDataDto } from '../dto/LoginDataDto';
import { AuthDataDto } from '../dto/AuthDataDto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('Auth Controller');
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginDataDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('Controller: login');
    const result = await this.authService.login(body.email, body.password);
    if (result.success === false) res.status(401);
    return result;
  }

  @Post('refresh')
  async refreshToken(
    @Body() body: AuthDataDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('Controller: refreshToken');
    const result = await this.authService.refreshToken(
      body.authToken,
      body.refreshToken,
    );
    if (result.success === false) res.status(401);
    return result;
  }
}
