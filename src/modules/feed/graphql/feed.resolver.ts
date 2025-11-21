/*
 * IMPORT
 */
import GetHomeFeed from "../services/getHomeFeed";

/*
 * RESOLVER
 */
const FeedResolvers = {
  Query: {
    GetHomeFeed: async (_: any, args: any, ctx: any) => {
      return GetHomeFeed(ctx.req.user.id, args.cursor, args.limit);
    },
  },
};

/*
 * EXPORT
 */
export default FeedResolvers;
