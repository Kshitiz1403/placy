import { ICommunity, ICommunityInputDTO } from '@/interfaces/ICommunity';
import mongoose from '@/loaders/mongoose';
import CommunityModel from '@/models/community';
import { Service } from 'typedi';
import { Db } from 'mongodb';
import { Types } from 'mongoose';

@Service()
export class CommunityRepository {
  protected db: Promise<Db>;
  constructor() {
    this.db = new Promise((resolve, reject) => {
      mongoose()
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  public getCommunity = async (communityId: ICommunity['_id']) => {
    try {
      const record = await CommunityModel.findOne({ _id: communityId }).lean();
      return record;
    } catch (e) {
      throw e;
    }
  };

  public getAllCommunities = async () => {
    try {
      const communities = await CommunityModel.find().lean();
      return communities;
    } catch (error) {
      throw error;
    }
  };

  public createCommunity = async (communityInputDTO: ICommunityInputDTO) => {
    try {
      const db = await this.db;
      const moderator = await db.collection('user').findOne({ _id: new Types.ObjectId(communityInputDTO.moderatorId) });
      if (!moderator) throw 'The moderator does not exists';

      const community = await CommunityModel.create({
        name: communityInputDTO.name,
        moderators: [communityInputDTO.moderatorId],
      });
      if (community) return community.toObject();
      return null;
    } catch (error) {
      throw error;
    }
  };

  public increaseTotalMembersForCommunity = async (communityId: ICommunity['_id'], increaseBy) => {
    try {
      const record = await CommunityModel.findOneAndUpdate(
        { _id: communityId },
        { $inc: { totalMembers: increaseBy } },
        { new: true },
      ).lean();
      if (record) return record;
      return null;
    } catch (error) {
      throw error;
    }
  };
}
