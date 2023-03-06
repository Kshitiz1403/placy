import { Router } from 'express';
import Container from 'typedi';
import { PostController } from '../controllers/postController';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  const ctrl: PostController = Container.get(PostController);

  app.use('/post', route);

  route.post('/:communityId', middlewares.isAuth, ctrl.createPost);

  route.post('/announcement/:communityId', middlewares.isAdminAuth, ctrl.adminCreatesPostForAnnouncement);

  route.delete('/:postId', middlewares.isAuth, ctrl.deletePost);

  route.get('/:postId', middlewares.isAuth, ctrl.getPost);

  route.patch('/:postId/likeUnlike', middlewares.isAuth, ctrl.likeUnlikePost);

  route.patch('/:postId/dislikeUndislike', middlewares.isAuth, ctrl.dislikeUndislikePost);

  route.post('/:postId/comment', middlewares.isAuth, ctrl.createComment);

  route.delete('/comment/:commentId', middlewares.isAuth, ctrl.deleteComment);

  route.patch('/comment/:commentId/likeUnlike', middlewares.isAuth, ctrl.likeUnlikeComment);

  route.patch('/comment/:commentId/dislikeUndislike', middlewares.isAuth, ctrl.dislikeUndislikeComment);
};
