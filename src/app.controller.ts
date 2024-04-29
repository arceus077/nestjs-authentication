import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserDataDto } from './dto/UserDataDto';

@Controller()
export class AppController {
  private readonly logger = new Logger('App Controller');
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus(): object {
    this.logger.log('Controller: getStatus');
    return this.appService.getStatus();
  }

  @Post('register')
  async registerUser(@Body() userData: UserDataDto) {
    this.logger.log('Controller: registerUser');
    return await this.appService.registerUser(userData);
  }

  @Get('*')
  @HttpCode(HttpStatus.NOT_FOUND)
  handleUndefinedRoutes(): object {
    this.logger.log('Controller: handleUndefinedRoutes');
    return this.appService.getUndefinedRoute();
  }
}
