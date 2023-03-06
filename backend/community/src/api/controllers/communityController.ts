import { ICommunityInputDTO } from '@/interfaces/ICommunity';
import CommunityService from '@/services/communityService';
import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { Result } from '../util/result';

@Service()
export class CommunityController {
  protected communityServiceInstance: CommunityService;
  protected logger: Logger;

  constructor(communityService: CommunityService, @Inject('logger') logger: Logger) {
    this.communityServiceInstance = communityService;
    this.logger = logger;
  }

  public createCommunity = async (req: Request, res: Response, next: NextFunction) => {
    this.logger.debug('Calling Create Community endpoint with body: %o', req.body);
    try {
      const name = req.body.name as ICommunityInputDTO['name'];
      const moderatorId = req.body.moderator as ICommunityInputDTO['moderatorId'];

      const community = await this.communityServiceInstance.createCommunity({ moderatorId, name });
      return res.status(200).json(Result.success(community));
    } catch (error) {
      this.logger.error('🔥 error: %o', error);
      return next(error);
    }
  };
}
