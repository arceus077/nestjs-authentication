import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Auth } from '../models/Auth';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth Service');
  constructor(
    @InjectModel('user') private userModel: Model<User>,
    @InjectModel('auth') private authModel: Model<Auth>,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string; data?: object }> {
    this.logger.log('Provider: login', { email });

    const user = await this.userModel.findOne({ email });
    if (!user) return { success: false, message: 'User does not exists' };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { success: false, message: 'Invalid/Wrong Password' };

    const { firstName, lastName, email: userEmail, _id: id } = user;
    this.logger.log('Provider: login', { email, firstName, lastName });

    const { authToken, refreshToken } = await this.generateAuthToken(
      id,
      firstName,
      lastName,
      userEmail,
    );

    return {
      success: true,
      data: { authToken, refreshToken },
    };
  }

  async generateAuthToken(
    id: mongoose.Schema.Types.ObjectId,
    firstName: string,
    lastName: string,
    email: string,
  ): Promise<{ authToken: string; refreshToken: string }> {
    this.logger.log('Provider: generateAuthToken', {
      email,
      firstName,
      lastName,
    });

    const payload = { id, firstName, lastName, email };
    const privateKey = process.env.PRIVATE_KEY;

    const authToken = jwt.sign(payload, privateKey, { expiresIn: '2h' });
    const refreshToken = jwt.sign(payload, privateKey, { expiresIn: '1d' });

    await new this.authModel({ email, authToken, refreshToken }).save();
    return { authToken, refreshToken };
  }

  async refreshToken(
    authToken: string,
    refreshToken: string,
  ): Promise<{
    success: boolean;
    message?: string;
    authToken?: string;
    refreshToken?: string;
  }> {
    try {
      this.logger.log('Provider: refreshToken', { authToken });

      const privateKey = process.env.PRIVATE_KEY;
      const authData = await this.authModel.findOne({
        authToken,
        refreshToken,
      });
      if (!authData) {
        return { success: false, message: 'Authentication data not found' };
      }

      try {
        jwt.verify(refreshToken, privateKey);
      } catch (error) {
        if (error?.name === 'TokenExpiredError') {
          return { success: false, message: 'Token Expired / Invalid' };
        }
      }

      try {
        jwt.verify(authToken, privateKey);
      } catch (error) {
        if (error?.name === 'TokenExpiredError') {
          const decodedValue: any = jwt.decode(authToken);
          delete decodedValue.iat;
          delete decodedValue.exp;

          const newAuthToken = jwt.sign(decodedValue, privateKey, {
            expiresIn: '2h',
          });
          const newRefreshToken = jwt.sign(decodedValue, privateKey, {
            expiresIn: '1d',
          });
          // Update the tokens in your database
          await this.authModel.updateOne(
            { _id: authData._id },
            { authToken: newAuthToken, refreshToken: newRefreshToken },
          );
          // Return the new tokens
          return {
            success: true,
            authToken: newAuthToken,
            refreshToken: newRefreshToken,
          };
        }
      }

      return { success: true, authToken, refreshToken };
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to refresh tokens');
    }
  }
}
