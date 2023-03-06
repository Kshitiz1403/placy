import { ICommunity, ICommunityInputDTO } from '@/interfaces/ICommunity';
import { IToken } from '@/interfaces/IToken';
import { IUserCommunity } from '@/interfaces/IUserCommunity';
import { CommunityRepository } from '@/repositories/communityRepository';
import { PostRepository } from '@/repositories/postRepository';
import { UserCommunityRepository } from '@/repositories/userCommunityRepository';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';

@Service()
export default class CommunityService {
  protected communityRepositoryInstance: CommunityRepository;
  protected userCommunityRepositoryInstance: UserCommunityRepository;
  protected postRepositoryInstance: PostRepository;

  constructor(
    communityRepository: CommunityRepository,
    userCommunityRepository: UserCommunityRepository,
    postRepository: PostRepository,
    @Inject('logger') private logger: Logger,
  ) {
    this.communityRepositoryInstance = communityRepository;
    this.userCommunityRepositoryInstance = userCommunityRepository;
    this.postRepositoryInstance = postRepository;
  }

  public createCommunity = async (communityInputDTO: ICommunityInputDTO) => {
    try {
      this.logger.silly('Creating community record');

      const communityRecord = await this.communityRepositoryInstance.createCommunity(communityInputDTO);

      if (!communityRecord) {
        throw 'Community cannot be created';
      }

      const community = { ...communityRecord };

      Reflect.deleteProperty(community, 'createdAt');
      Reflect.deleteProperty(community, 'updatedAt');

      return { community };
    } catch (error) {
      throw error;
    }
  };

  public subscribeToCommunity = async (
    userId: IUserCommunity['userId'],
    communityId: IUserCommunity['communityId'],
  ) => {
    this.logger.silly('Creating userCommunities record');
    try {
      const userCommunitiesRecord = await this.userCommunityRepositoryInstance.subscribeUserToCommunity(
        userId,
        communityId,
      );
      if (!userCommunitiesRecord) throw 'Cannot subscribe to the community';

      const updatedCommunity = await this.communityRepositoryInstance.increaseTotalMembersForCommunity(communityId, 1);

      const userCommunity = { ...userCommunitiesRecord };

      Reflect.deleteProperty(userCommunity, '_id');
      Reflect.deleteProperty(userCommunity, 'createdAt');
      Reflect.deleteProperty(userCommunity, 'updatedAt');

      return userCommunity;
    } catch (error) {
      throw error;
    }
  };

  public leaveCommunity = async (userId: IUserCommunity['userId'], communityId: IUserCommunity['communityId']) => {
    try {
      const status = await this.userCommunityRepositoryInstance.deleteUserFromCommunity(userId, communityId);
      if (status.deletedCount == 0) throw 'You are not subscribed to this community';

      const community = await this.communityRepositoryInstance.increaseTotalMembersForCommunity(communityId, -1);

      return `Successfully left ${community.name}`;
    } catch (error) {
      throw error;
    }
  };

  public getAllCommunities = async () => {
    this.logger.silly('Getting all communities');

    try {
      const communitiesRecord = await this.communityRepositoryInstance.getAllCommunities();
      const communities = [...communitiesRecord]
        .filter(community => community.isClosed == false)
        .map(({ createdAt, updatedAt, __v, ...restAttr }) => restAttr);

      return communities;
    } catch (error) {
      throw error;
    }
  };

  public getAllCommunitiesForUser = async (userId: IUserCommunity['userId']) => {
    this.logger.silly('Getting all user subscribed communities');
    try {
      const userCommunitiesRecords = await this.userCommunityRepositoryInstance.getAllCommunitiesForUser(userId);
      const results = userCommunitiesRecords.map(({ createdAt, updatedAt, userId, ...restData }) => restData);

      return results;
    } catch (error) {
      throw error;
    }
  };

  public getCommunityPaginated = async (userId: IToken['userId'], communityId: ICommunity['_id'], pageNumber = 0) => {
    try {
      const limit = 10;

      let isJoined = false;

      const isUserJoined = await this.userCommunityRepositoryInstance.getUserCommunity(userId, communityId);
      if (isUserJoined) isJoined = true;

      const communityRecord = { ...(await this.communityRepositoryInstance.getCommunity(communityId)) };
      if (!communityRecord || communityRecord.isClosed) throw 'The community does not exist';

      const communityObj = {};
      communityObj['_id'] = communityRecord._id;
      communityObj['name'] = communityRecord.name;
      communityObj['members'] = communityRecord.totalMembers;
      communityObj['joined'] = isJoined;
      communityObj['createdAt'] = communityRecord.createdAt;

      const posts = await this.postRepositoryInstance.getPostsForCommunityPaginated(communityId, pageNumber, limit);

      const postsArr = posts
        .filter(post => !post.isUserBanned)
        .map(post => {
          let likedByMe = false;
          let dislikedByMe = false;
          for (let likedId of post.likedBy) {
            if (likedId == userId) {
              likedByMe = true;
              break;
            }
          }
          if (!likedByMe)
            for (let dislikedId of post.dislikedBy) {
              if (dislikedId == userId) {
                dislikedByMe = true;
                break;
              }
            }
          post['likedByMe'] = likedByMe;
          post['dislikedByMe'] = dislikedByMe;
          post['createdBy'] = {};
          post['createdBy']['_id'] = post.userId;
          post['createdBy']['username'] = post.username;

          delete post.userId;
          delete post.likedBy;
          delete post.dislikedBy;
          delete post.__v;
          delete post.isUserBanned;
          delete post.username;
          return post;
        });
      communityObj['posts'] = postsArr;
      return communityObj;
    } catch (error) {
      throw error;
    }
  };
}
