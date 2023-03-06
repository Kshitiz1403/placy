import { ICommunity, ICommunityInputDTO } from '@/interfaces/ICommunity';
import { IUserCommunity } from '@/interfaces/IUserCommunity';
import CommunityService from '@/services/communityService';
import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { INextFunction, IRequest, IResponse } from '../types/express';
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
      return next(error);
    }
  };

  public subscribeToCommunity = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Subscribe to Community endpoint with %o', { body: req.body, params: req.params });
    try {
      const userId = req.currentUser.userId;
      const communityId = req.params.communityId as unknown as IUserCommunity['communityId'];

      const userCommunity = await this.communityServiceInstance.subscribeToCommunity(userId, communityId);
      return res.status(200).json(Result.success(userCommunity));
    } catch (error) {
      return next(error);
    }
  };

  public leaveCommunity = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling leave community endpoint with %o', { body: req.body, params: req.params });
    try {
      const userId = req.currentUser.userId;
      const communityId = req.params.communityId as unknown as IUserCommunity['communityId'];

      const status = await this.communityServiceInstance.leaveCommunity(userId, communityId);
      return res.status(200).json(Result.success(status));
    } catch (error) {
      return next(error);
    }
  };

  public getAllCommunities = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling all communities endpoint with');
    try {
      const communities = await this.communityServiceInstance.getAllCommunities();
      return res.status(200).json(Result.success(communities));
    } catch (error) {
      return next(error);
    }
  };

  public getAllCommunitiesForUser = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling My Communities endpoint with %o', { body: req.body, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const communities = await this.communityServiceInstance.getAllCommunitiesForUser(userId);
      return res.status(200).json(Result.success(communities));
    } catch (error) {
      return next(error);
    }
  };

  public getCommunityPaginated = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling get posts for community endpoint with %o', { query: req.query, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const communityId = req.params.communityId as unknown as ICommunity['_id'];
      const pageNumber = +req.query.page as unknown as number;
      const posts = await this.communityServiceInstance.getCommunityPaginated(userId, communityId, pageNumber);
      return res.status(200).json(Result.success(posts));
    } catch (error) {
      return next(error);
    }
  };
}
