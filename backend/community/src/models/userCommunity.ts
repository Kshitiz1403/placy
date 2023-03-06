import { IUserCommunity } from '@/interfaces/IUserCommunity';
import mongoose from 'mongoose';

const UserCommunity = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUserCommunity & mongoose.Document>('UserCommunity', UserCommunity);
