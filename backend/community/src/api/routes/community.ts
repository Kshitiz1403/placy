import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { CommunityController } from '../controllers/communityController';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  const ctrl: CommunityController = Container.get(CommunityController);

  app.use('/community', route);

  route.get('/:communityId/posts', middlewares.isAuth, ctrl.getPostsForCommunityPaginated);

  route.post('/create', ctrl.createCommunity);

  route.post('/:communityId/subscribe', middlewares.isAuth, ctrl.subscribeToCommunity);

  route.delete('/:communityId/leave', middlewares.isAuth, ctrl.leaveCommunity);

  route.get('/my', middlewares.isAuth, ctrl.getAllCommunitiesForUser);
};
