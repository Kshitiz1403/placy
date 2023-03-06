import { Types } from 'mongoose';

export interface ICommunity {
  _id: Types.ObjectId;
  name: String;
  totalMembers: Number;
  isClosed?: Boolean;
  moderators: Types.ObjectId[];
}

export interface ICommunityInputDTO {
  name: ICommunity['name'];
  moderatorId: ICommunity['moderators'][0];
}
