import { IComment, ICommentCreateInputDTO } from '@/interfaces/IComment';
import { ICommunity } from '@/interfaces/ICommunity';
import mongoose from '@/loaders/mongoose';
import { Db } from 'mongodb';
import CommentModel from '@/models/comment';
import { Types } from 'mongoose';
import { Service } from 'typedi';

@Service()
export class CommentRepository {
  protected db: Promise<Db>;

  constructor() {
    this.db = new Promise((resolve, reject) => {
      mongoose()
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  public createComment = async (commentInputDTO: ICommentCreateInputDTO) => {
    try {
      const comment = await CommentModel.create({ ...commentInputDTO });
      if (comment) return comment.toObject();
      return null;
    } catch (e) {
      throw e;
    }
  };

  public linkCommentToParent = async (commentId: IComment['_id'], parentId: IComment['parentId']) => {
    try {
      const parentComment = await CommentModel.findOneAndUpdate(
        { _id: parentId },
        { $push: { children: new Types.ObjectId(commentId) } },
        { new: true },
      ).lean();
      if (!parentComment) throw 'The parent comment does not exist';

      return parentComment;
    } catch (e) {
      throw e;
    }
  };

  public getCommentsForPost = async (postId: IComment['postId']) => {
    try {
      const comments = await CommentModel.find({ postId }).lean();
      return comments;
    } catch (e) {
      throw e;
    }
  };

  public getCommentByIdWithModerator = async (
    commentId: IComment['_id'],
  ): Promise<IComment & { moderators: ICommunity['moderators'] }> => {
    const records = await CommentModel.aggregate([
      { $match: { _id: new Types.ObjectId(commentId) } },
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'posts',
        },
      },
      { $unwind: '$posts' },
      {
        $lookup: {
          from: 'communities',
          localField: 'posts.communityId',
          foreignField: '_id',
          as: 'communities',
        },
      },
      { $unwind: '$communities' },
      {
        $addFields: { moderators: '$communities.moderators' },
      },
      {
        $project: {
          communities: 0,
          posts: 0,
        },
      },
    ]).limit(1);
    if (!records || records.length == 0) return null;
    return records[0];
  };

  public softDeleteComment = async commentId => {
    const db = await this.db;
    const doc = await db.collection('comments').findOne({ _id: Types.ObjectId(commentId) });
    if (doc.parentId) {
      /**
       * Unlink parent doc children array
       */
      const parentDoc = CommentModel.findOneAndUpdate(
        { _id: Types.ObjectId(doc.parentId) },
        { $pull: { children: new Types.ObjectId(doc._id) } },
        { new: true },
      ).lean();
    }
    const newDoc = await db.collection('deletedComments').insertOne({ ...doc, deletedAt: new Date() });
    await db.collection('comments').deleteOne(doc);
    return newDoc;
  };

  public likeUnlikeComment = async (userId: IComment['userId'], commentId: IComment['_id']) => {
    /**
     * Add userId to liked by array
     * Increase number of likes
     * If userId in dislikedBy, remove it and decrease the number of dislikes
     */
    try {
      const isLiked = await CommentModel.findOne({
        _id: commentId,
        likedBy: { $in: [new Types.ObjectId(userId)] },
      })
        .limit(1)
        .lean();

      if (isLiked) {
        // start process for unLiking the comment
        return await CommentModel.findOneAndUpdate(
          { _id: commentId },
          { $inc: { likes: -1 }, $pull: { likedBy: new Types.ObjectId(userId) } },
          { new: true },
        ).lean();
      }
      // start process for liking the comment
      const isDisliked = await CommentModel.findOne({
        _id: commentId,
        dislikedBy: { $in: [new Types.ObjectId(userId)] },
      }).lean();

      if (isDisliked) {
        return await CommentModel.findOneAndUpdate(
          { _id: commentId },
          {
            $inc: { dislikes: -1, likes: 1 },
            $pull: { dislikedBy: new Types.ObjectId(userId) },
            $push: { likedBy: new Types.ObjectId(userId) },
          },
          { new: true },
        ).lean();
      }

      return await CommentModel.findOneAndUpdate(
        { _id: commentId },
        { $inc: { likes: 1 }, $push: { likedBy: new Types.ObjectId(userId) } },
        { new: true },
      ).lean();
    } catch (e) {
      throw e;
    }
  };

  public dislikeUndislikeComment = async (userId: IComment['userId'], commentId: IComment['_id']) => {
    try {
      const isDisliked = await CommentModel.findOne({
        _id: commentId,
        dislikedBy: { $in: [new Types.ObjectId(userId)] },
      }).lean();

      if (isDisliked) {
        // start process for unDisLiking the comment
        return await CommentModel.findOneAndUpdate(
          { _id: commentId },
          { $inc: { dislikes: -1 }, $pull: { dislikedBy: new Types.ObjectId(userId) } },
          { new: true },
        ).lean();
      }
      // start process for disliking the comment
      const isLiked = await CommentModel.findOne({
        _id: commentId,
        likedBy: { $in: [new Types.ObjectId(userId)] },
      }).lean();

      if (isLiked) {
        return await CommentModel.findOneAndUpdate(
          { _id: commentId },
          {
            $inc: { likes: -1, disliked: 1 },
            $pull: { likedBy: new Types.ObjectId(userId) },
            $push: { dislikedBy: new Types.ObjectId(userId) },
          },
          { new: true },
        ).lean();
      }

      return await CommentModel.findOneAndUpdate(
        { _id: commentId },
        { $inc: { dislikes: 1 }, $push: { dislikedBy: new Types.ObjectId(userId) } },
        { new: true },
      ).lean();
    } catch (e) {
      throw e;
    }
  };
}
