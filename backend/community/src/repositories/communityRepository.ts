import { ICommunityInputDTO } from '@/interfaces/ICommunity';
import mongoose from '@/loaders/mongoose';
import CommunityModel from '@/models/community';
import { Service } from 'typedi';

@Service()
export class CommunityRepository {
  constructor() {}

  public createCommunity = async (communityInputDTO: ICommunityInputDTO) => {
    try {
      const db = await mongoose();
      const moderator = db.collection('user').findOne({ _id: communityInputDTO.moderatorId });
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
}
