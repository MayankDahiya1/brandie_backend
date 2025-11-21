/*
 * IMPORT
 */
import LikePostService from "../services/likePost";
import UnlikePostService from "../services/unlikePost";
import GetPostLikesService from "../services/getPostLikes";
import GetPostLikeCountService from "../services/getPostLikeCount";
import HasLikedService from "../services/hasLiked";

/*
 * RESOLVER
 */
const LikeResolver = {
  Mutation: {
    LikePost: async (_: any, { postId }: any, ctx: any) => {
      return LikePostService(ctx.req.user.id, String(postId));
    },

    UnlikePost: async (_: any, { postId }: any, ctx: any) => {
      return UnlikePostService(ctx.req.user.id, String(postId));
    },
  },

  Query: {
    GetPostLikes: async (_: any, { postId }: any) => {
      return GetPostLikesService(String(postId));
    },

    GetPostLikeCount: async (_: any, { postId }: any) => {
      return GetPostLikeCountService(String(postId));
    },

    HasLiked: async (_: any, { postId }: any, ctx: any) => {
      return HasLikedService(ctx.req.user.id, String(postId));
    },
  },
};

/*
 * EXPORT
 */
export default LikeResolver;
