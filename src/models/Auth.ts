import * as mongoose from 'mongoose';

export const AuthSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  authToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

export interface Auth extends mongoose.Document {
  email: string;
  authToken: string;
  refreshToken: string;
}
