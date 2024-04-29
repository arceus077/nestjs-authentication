import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './models/User';
import { UserDataDto } from './dto/UserDataDto';

@Injectable()
export class AppService {
  private readonly logger = new Logger('App Service');
  constructor(@InjectModel('user') private userModel: Model<User>) {}

  async registerUser(userData: UserDataDto): Promise<object> {
    const { email, password } = userData;
    this.logger.log('Provider: registerUser', { email });

    const user = await this.userModel.findOne({ email });

    if (!user) {
      const hashPassword = bcrypt.hashSync(password, 10);
      const newUser = new this.userModel({
        ...userData,
        password: hashPassword,
      });
      await newUser.save();
      return { success: true };
    }

    return { success: false, message: 'User already exists' };
  }

  getStatus(): object {
    this.logger.log('Provider: getStatus');
    return { status: 'OK' };
  }

  getUndefinedRoute(): object {
    this.logger.log('Provider: getUndefinedRoute');
    return { messgae: 'Route Not Found' };
  }
}
