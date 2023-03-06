import { IPost } from '@/interfaces/IPost';
import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema(
  {
    imageURI: String,
    videoURI: String,
    content: {
      type: String,
      default: '',
    },
  },
  { _id: false },
);

const Post = new mongoose.Schema(
  {
    data: dataSchema,
    communityId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
    },
    announcementId: {
      type: mongoose.Types.ObjectId,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Types.ObjectId }],
    dislikedBy: [{ type: mongoose.Types.ObjectId }],
    type: {
      type: String,
      enum: ['Announcement', 'General'],
      default: 'General',
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPost & mongoose.Document>('Post', Post);
