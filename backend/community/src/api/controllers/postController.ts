import { IComment, ICommentCreateInputDTO } from '@/interfaces/IComment';
import { IPost, IPostInputDTO } from '@/interfaces/IPost';
import { PostService } from '@/services/postService';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { INextFunction, IRequest, IResponse } from '../types/express';
import { Result } from '../util/result';

@Service()
export class PostController {
  protected postServiceInstance: PostService;
  protected logger: Logger;

  constructor(postService: PostService, @Inject('logger') logger: Logger) {
    this.postServiceInstance = postService;
    this.logger = logger;
  }

  public createPost = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Create Post endpoint with %o', { body: req.body, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const data = req.body.data as IPostInputDTO['data'];
      const communityId = req.params.communityId as unknown as IPostInputDTO['communityId'];

      const post = await this.postServiceInstance.createPost({ userId, communityId, data });
      return res.status(200).json(Result.success(post));
    } catch (error) {
      return next(error);
    }
  };

  public adminCreatesPostForAnnouncement = async (req: IRequest, res: IResponse, next: INextFunction) => {
    try {
      const adminId = req.currentUser.userId;
      const data = req.body.data as IPostInputDTO['data'];
      const communityId = req.params.communityId as unknown as IPostInputDTO['communityId'];
      const announcementId = req.body.announcementId as IPostInputDTO['announcementId'];

      const post = await this.postServiceInstance.adminCreatesPostForAnnouncement({
        communityId,
        data,
        announcementId,
        userId: adminId,
      });

      return res.status(200).json(Result.success(post));
    } catch (e) {
      return next(e);
    }
  };

  public deletePost = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Delete Post endpoint with params', req.params);

    try {
      const userId = req.currentUser.userId;
      const postId = req.params.postId as unknown as IPost['_id'];
      const post = await this.postServiceInstance.deletePost(userId, postId);
      return res.status(200).json(Result.success(post));
    } catch (error) {
      return next(error);
    }
  };

  public getPost = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Get Post endpoint with %o', { query: req.query, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const postId = req.params.postId as unknown as ICommentCreateInputDTO['postId'];

      const post = await this.postServiceInstance.getPost(userId, postId);
      return res.status(200).json(Result.success(post));
    } catch (error) {
      return next(error);
    }
  };

  public likeUnlikePost = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Like/Unlike Post endpoint with %o', { body: req.body, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const postId = req.params.postId as unknown as IPost['_id'];

      const post = await this.postServiceInstance.likeUnlikePost(userId, postId);
      return res.status(200).json(Result.success(post));
    } catch (error) {
      return next(error);
    }
  };

  public dislikeUndislikePost = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Dislike/Undislike Post endpoint with %o', { body: req.body, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const postId = req.params.postId as unknown as IPost['_id'];

      const post = await this.postServiceInstance.dislikeUndislikePost(userId, postId);
      return res.status(200).json(Result.success(post));
    } catch (error) {
      return next(error);
    }
  };

  public createComment = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Create Comment endpoint with %o', { body: req.body, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const postId = req.params.postId as unknown as ICommentCreateInputDTO['postId'];
      const content = req.body.content;
      const parentId = req.body.parentId || null;

      const comment = await this.postServiceInstance.createComment({ userId, postId, content, parentId });
      return res.status(200).json(Result.success(comment));
    } catch (error) {
      return next(error);
    }
  };

  public deleteComment = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Delete Comment endpoint with params', req.params);

    try {
      const userId = req.currentUser.userId;
      const commentId = req.params.commentId as unknown as IComment['_id'];

      const comment = await this.postServiceInstance.deleteComment(userId, commentId);
      return res.status(200).json(Result.success(comment));
    } catch (error) {
      return next(error);
    }
  };

  public likeUnlikeComment = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Like/Unlike Comment endpoint with %o', { body: req.body, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const commentId = req.params.commentId as unknown as IComment['_id'];

      const comment = await this.postServiceInstance.likeUnlikeComment(userId, commentId);

      return res.status(200).json(Result.success(comment));
    } catch (error) {
      return next(error);
    }
  };

  public dislikeUndislikeComment = async (req: IRequest, res: IResponse, next: INextFunction) => {
    this.logger.debug('Calling Dislike/Undislike Comment endpoint with %o', { body: req.body, params: req.params });

    try {
      const userId = req.currentUser.userId;
      const commentId = req.params.commentId as unknown as IComment['_id'];

      const comment = await this.postServiceInstance.dislikeUndislikeComment(userId, commentId);

      return res.status(200).json(Result.success(comment));
    } catch (error) {
      return next(error);
    }
  };
}
