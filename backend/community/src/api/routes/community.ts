import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import { CommunityController } from '../controllers/communityController';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  const ctrl: CommunityController = Container.get(CommunityController);

  app.use('/community', route);

  route.get('/', middlewares.isAuth, ctrl.getAllCommunities);

  route.get('/my', middlewares.isAuth, ctrl.getAllCommunitiesForUser);

  route.get('/:communityId', middlewares.isAuth, ctrl.getCommunityPaginated);

  route.post('/create', middlewares.isAdminAuth, ctrl.createCommunity);

  route.post('/:communityId/subscribe', middlewares.isAuth, ctrl.subscribeToCommunity);

  route.delete('/:communityId/leave', middlewares.isAuth, ctrl.leaveCommunity);
};
