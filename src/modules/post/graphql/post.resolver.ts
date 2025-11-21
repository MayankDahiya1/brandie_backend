/*
 * IMPORT
 */
import CreatePostService from "../services/createPost";
import GetMyPostsService from "../services/getMyPosts";
import GetUserPostsService from "../services/getUserPosts";

/*
 * RESOLVER
 */
const PostResolver = {
  Mutation: {
    CreatePost: async (_: any, { text, mediaUrl }: any, ctx: any) => {
      const currentUserId = ctx.req.user.id;
      return CreatePostService(currentUserId, text, mediaUrl);
    },
  },

  Query: {
    MyPosts: async (_: any, { limit, offset }: any, ctx: any) => {
      return GetMyPostsService(ctx.req.user.id, limit, offset);
    },

    UserPosts: async (_: any, { userId, limit, offset }: any) => {
      return GetUserPostsService(userId, limit, offset);
    },
  },

  Post: {
    author: async (parent: any) => {
      return parent.author;
    },
  },
};

/*
 * EXPORT
 */
export default PostResolver;
