/*
 * IMPORT
 */
import FollowUser from "../services/followUser";
import UnfollowUser from "../services/unfollowUser";
import GetFollowers from "../services/getFollowers";
import GetFollowing from "../services/getFollowing";
import IsFollowingService from "../services/isFollowing";

/*
 * RESOLVER
 */
const FollowResolver = {
  Mutation: {
    FollowUser: async (_: any, { userId }: any, ctx: any) => {
      return FollowUser(ctx.req.user.id, userId);
    },

    UnfollowUser: async (_: any, { userId }: any, ctx: any) => {
      return UnfollowUser(ctx.req.user.id, userId);
    },
  },

  Query: {
    Followers: async (_: any, { userId }: any) => {
      return GetFollowers(userId);
    },

    Following: async (_: any, { userId }: any) => {
      return GetFollowing(userId);
    },

    IsFollowing: async (_: any, { userId }: any, ctx: any) => {
      return IsFollowingService(ctx.req.user.id, userId);
    },
  },
};

/*
 * EXPORT
 */
export default FollowResolver;
