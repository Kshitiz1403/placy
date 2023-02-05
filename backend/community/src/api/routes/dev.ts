import { Router } from 'express';
import Container from 'typedi';
import { DevController } from '../controllers/devController';

const route = Router();
export default (app: Router) => {
  const ctrl: DevController = Container.get(DevController);

  app.use('/dev', route);

  route.post('/email', ctrl.sendEmail);
};
