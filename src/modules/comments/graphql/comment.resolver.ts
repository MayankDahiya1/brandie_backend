/*
 * IMPORT
 */
import AddCommentService from "../services/addComment";
import DeleteCommentService from "../services/deleteComment";
import GetCommentsService from "../services/getComments";
import GetCommentCountService from "../services/getCommentCount";

/*
 * RESOLVER
 */
const CommentResolver = {
  Mutation: {
    AddComment: async (_: any, { postId, text }: any, ctx: any) => {
      return AddCommentService(ctx.req.user.id, postId, text);
    },

    DeleteComment: async (_: any, { commentId }: any, ctx: any) => {
      return DeleteCommentService(ctx.req.user.id, commentId);
    },
  },

  Query: {
    GetComments: async (_: any, { postId, cursor, limit }: any) => {
      return GetCommentsService(postId, cursor, limit);
    },

    GetCommentCount: async (_: any, { postId }: any) => {
      return GetCommentCountService(postId);
    },
  },
};

/*
 * EXPORT
 */
export default CommentResolver;
