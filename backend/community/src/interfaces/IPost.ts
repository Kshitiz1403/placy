import { Types } from 'mongoose';

export interface IPost {
  _id: Types.ObjectId;
  data: IPostData;
  communityId?: Types.ObjectId;
  userId: Types.ObjectId;
  likes: number;
  dislikes: number;
  likedBy: Types.ObjectId[];
  dislikedBy: Types.ObjectId[];
  type: 'Announcement' | 'General';
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostData {
  imageURI?: String;
  videoURI?: String;
  content: String;
}

export interface IPostInputDTO {
  data: IPost['data'];
  communityId?: IPost['communityId'];
  userId: IPost['userId'];
  type?: IPost['type'];
}
export interface IAnnouncementInputDTO {
  data: IPost['data'];
  userId: IPost['userId'];
}
export type IPostMinInputDTO = Omit<IPostInputDTO, 'type'>;
