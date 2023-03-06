import { ICommunityInputDTO } from '@/interfaces/ICommunity';
import { CommunityRepository } from '@/repositories/communityRepository';
import { Inject } from 'typedi';
import { Logger } from 'winston';

export default class CommunityService {
  protected communityRepositoryInstance: CommunityRepository;

  constructor(communityRepository: CommunityRepository, @Inject('logger') private logger: Logger) {
    this.communityRepositoryInstance = communityRepository;
  }

  public createCommunity = async (communityInputDTO: ICommunityInputDTO) => {
    try {
      this.logger.silly('Creating community record');

      const communityRecord = await this.communityRepositoryInstance.createCommunity(communityInputDTO);

      if (!communityRecord) {
        throw 'Community cannot be created';
      }

      const community = { ...communityRecord };

      Reflect.deleteProperty(community, 'createdAt');
      Reflect.deleteProperty(community, 'updatedAt');

      return { community };
    } catch (error) {
      throw error;
    }
  };
}
