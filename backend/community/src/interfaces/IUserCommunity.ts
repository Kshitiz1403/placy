import { Types } from 'mongoose';

export interface IUserCommunity {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  communityId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
