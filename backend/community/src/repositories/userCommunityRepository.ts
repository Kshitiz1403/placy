import { Service } from 'typedi';
import UserCommunityModel from '@/models/userCommunity';
import { IUserCommunity } from '@/interfaces/IUserCommunity';
import { Types } from 'mongoose';

@Service()
export class UserCommunityRepository {
  constructor() {}

  public getUserCommunity = async (userId: IUserCommunity['userId'], communityId: IUserCommunity['communityId']) => {
    return UserCommunityModel.findOne({ userId, communityId }).lean();
  };

  public subscribeUserToCommunity = async (
    userId: IUserCommunity['userId'],
    communityId: IUserCommunity['communityId'],
  ) => {
    try {
      const checkExistence = await UserCommunityModel.findOne({ userId, communityId });
      if (checkExistence) {
        throw 'You are already subscribed to this community.';
      }
      const record = await UserCommunityModel.create({ userId: userId, communityId: communityId });
      if (record) return record.toObject();
      return null;
    } catch (e) {
      throw e;
    }
  };

  public deleteUserFromCommunity = async (
    userId: IUserCommunity['userId'],
    communityId: IUserCommunity['communityId'],
  ) => {
    try {
      const status = await UserCommunityModel.deleteOne({ userId, communityId });
      return status;
    } catch (e) {
      throw e;
    }
  };

  public getAllCommunitiesForUser = async (userId: IUserCommunity['userId']) => {
    try {
      const records = await UserCommunityModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'communities',
            localField: 'communityId',
            foreignField: '_id',
            as: 'community',
          },
        },
        {
          $unwind: '$community',
        },
        {
          $addFields: {
            name: '$community.name',
            moderators: '$community.moderators',
            totalMembers: '$community.totalMembers',
            isClosed: '$community.isClosed',
            joined: '$community.createdAt',
          },
        },
        {
          $match: {
            isClosed: false,
          },
        },
        {
          $project: {
            community: 0,
            isClosed: 0,
            _id: 0,
            __v: 0,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
      return records;
    } catch (e) {
      throw e;
    }
  };
}
