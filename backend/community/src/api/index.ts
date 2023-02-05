import { Router } from 'express';
import community from './routes/community';
import post from './routes/post';
import dev from './routes/dev';
import upload from './routes/upload';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  community(app);
  post(app);
  upload(app);
  dev(app);
  return app;
};
