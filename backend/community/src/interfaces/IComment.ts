import { Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  content: String;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  parentId?: Types.ObjectId;
  children: Array<Types.ObjectId>;
  isEdited?: Boolean;
  likes: number;
  likedBy: Array<Types.ObjectId>;
  dislikes: number;
  dislikedBy: Array<Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentCreateInputDTO {
  content: IComment['content'];
  userId: IComment['userId'];
  postId: IComment['postId'];
  parentId?: IComment['parentId'];
}
