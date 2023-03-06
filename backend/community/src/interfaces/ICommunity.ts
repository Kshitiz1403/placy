import { Types } from 'mongoose';

export interface ICommunity {
  _id: Types.ObjectId;
  name: String;
  totalMembers: number;
  imageURI?: String;
  description: String;
  isClosed?: Boolean;
  moderators: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommunityInputDTO {
  name: ICommunity['name'];
  moderatorId: ICommunity['moderators'][0];
}
