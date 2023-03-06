import { Types } from 'mongoose';

export interface IToken {
  userId: Types.ObjectId;
  username: String;
  role: 'user' | 'officer' | 'admin';
  iat: Number;
  exp: Number;
}
