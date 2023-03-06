import { Service } from 'typedi';
import PostModel from '@/models/post';
import { IPost, IPostInputDTO } from '@/interfaces/IPost';
import { Types } from 'mongoose';
import { Db } from 'mongodb';
import mongoose from '@/loaders/mongoose';
import { ICommunity } from '@/interfaces/ICommunity';

@Service()
export class PostRepository {
  protected db: Promise<Db>;

  constructor() {
    this.db = new Promise((resolve, reject) => {
      mongoose()
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  public getPostById = async (postId: IPost['_id']) => {
    try {
      const record = await PostModel.findOne({ _id: postId }).lean();
      return record;
    } catch (error) {
      throw error;
    }
  };

  public getPostByIdWithModerator = async (
    postId: IPost['_id'],
  ): Promise<IPost & { moderators: ICommunity['moderators'] }> => {
    const record = await PostModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(postId),
        },
      },
      {
        $lookup: {
          from: 'communities',
          localField: 'communityId',
          foreignField: '_id',
          as: 'communities',
        },
      },
      {
        $unwind: '$communities',
      },
      {
        $addFields: {
          moderators: '$communities.moderators',
        },
      },
      {
        $project: {
          communities: 0,
        },
      },
    ]).limit(1);
    if (!record || record.length == 0) return null;
    return record[0];
  };

  public getPostByIdAggregated = async (postId: IPost['_id']) => {
    try {
      const record = await PostModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(postId),
          },
        },
        {
          $lookup: {
            from: 'user',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $addFields: {
            username: '$user.username',
            userRole: '$user.role',
            isUserBanned: '$user.isBanned',
          },
        },
        {
          $project: {
            user: 0,
          },
        },
      ]).limit(1);
      if (!record || record.length == 0) return null;
      return record[0];
    } catch (e) {
      throw e;
    }
  };

  public softDeletePost = async postId => {
    const db = await this.db;
    const doc = await db.collection('posts').findOne({ _id: Types.ObjectId(postId) });
    const newDoc = await db.collection('deletedPosts').insertOne({ ...doc, deletedAt: new Date() });
    await db.collection('posts').deleteOne(doc);
    return newDoc;
  };

  public createPost = async (postInputDTO: IPostInputDTO): Promise<IPost | null> => {
    try {
      const post = await PostModel.create({ ...postInputDTO });
      if (post) return post.toObject();
      return null;
    } catch (e) {
      throw e;
    }
  };

  public getPostsForCommunityPaginated = async (
    communityId: IPost['communityId'],
    pageNumber: number,
    limit: number,
  ): Promise<(IPost & { username: String; isUserBanned: boolean; __v: number })[]> => {
    try {
      const posts = await PostModel.aggregate([
        { $match: { communityId: new Types.ObjectId(communityId) } },
        { $sort: { createdAt: -1 } },
        { $skip: pageNumber * limit },
        { $limit: limit },
        {
          $lookup: {
            from: 'user',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $addFields: { username: '$user.username', isUserBanned: '$user.isBanned' } },
        { $project: { user: 0 } },
      ]);
      return posts;
    } catch (e) {
      throw e;
    }
  };

  public likeUnlikePost = async (userId: IPost['userId'], postId: IPost['_id']) => {
    try {
      const isLiked = await PostModel.findOne({ _id: postId, likedBy: { $in: [new Types.ObjectId(userId)] } })
        .limit(1)
        .lean();

      if (isLiked) {
        // start process for unLiking the post
        return await PostModel.findOneAndUpdate(
          { _id: postId },
          { $inc: { likes: -1 }, $pull: { likedBy: new Types.ObjectId(userId) } },
          { new: true },
        ).lean();
      }

      // start process for liking the post
      const isDisliked = await PostModel.findOne({
        _id: postId,
        dislikedBy: { $in: [new Types.ObjectId(userId)] },
      }).lean();

      if (isDisliked) {
        return await PostModel.findOneAndUpdate(
          { _id: postId },
          {
            $inc: { dislikes: -1, likes: 1 },
            $pull: { dislikedBy: new Types.ObjectId(userId) },
            $push: { likedBy: new Types.ObjectId(userId) },
          },
          { new: true },
        ).lean();
      }

      return await PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 }, $push: { likedBy: new Types.ObjectId(userId) } },
        { new: true },
      ).lean();
    } catch (e) {
      throw e;
    }
  };

  public dislikeUndislikePost = async (userId: IPost['userId'], postId: IPost['_id']) => {
    try {
      const isDisliked = await PostModel.findOne({
        _id: postId,
        dislikedBy: { $in: [new Types.ObjectId(userId)] },
      }).lean();

      if (isDisliked) {
        // start process for undisliking the post
        return await PostModel.findOneAndUpdate(
          { _id: postId },
          { $inc: { dislikes: -1 }, $pull: { dislikedBy: new Types.ObjectId(userId) } },
          { new: true },
        ).lean();
      }

      // start process for disliking the comment
      const isLiked = await PostModel.findOne({
        _id: postId,
        likedBy: { $in: [new Types.ObjectId(userId)] },
      }).lean();

      if (isLiked) {
        return await PostModel.findOneAndUpdate(
          { _id: postId },
          {
            $inc: { likes: -1, dislikes: 1 },
            $pull: { likedBy: new Types.ObjectId(userId) },
            $push: { dislikedBy: new Types.ObjectId(userId) },
          },
          { new: true },
        ).lean();
      }

      return await PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { dislikes: 1 }, $push: { dislikedBy: new Types.ObjectId(userId) } },
        { new: true },
      ).lean();
    } catch (e) {
      throw e;
    }
  };
}
