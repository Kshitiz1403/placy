import { Router } from 'express';
import community from './routes/community';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  community(app);
  return app;
};
