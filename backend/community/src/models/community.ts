import { ICommunity } from '@/interfaces/ICommunity';
import mongoose, { Types } from 'mongoose';

const Community = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    totalMembers: {
      type: Number,
      default: 1,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    moderators: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true },
);

export default mongoose.model<ICommunity & mongoose.Document>('Community', Community);
