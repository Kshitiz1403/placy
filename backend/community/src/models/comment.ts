import { IComment } from '@/interfaces/IComment';
import mongoose from 'mongoose';

const Comment = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Types.ObjectId,
      index: true,
    },
    postId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
    },
    children: [{ type: mongoose.Types.ObjectId }],
    content: {
      type: String,
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Types.ObjectId }],
    dislikes: {
      type: Number,
      default: 0,
    },
    dislikedBy: [{ type: mongoose.Types.ObjectId }],
  },
  { timestamps: true },
);

export default mongoose.model<IComment & mongoose.Document>('Comment', Comment);
