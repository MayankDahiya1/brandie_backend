/*
 * IMPORT
 */
import { FeedSchema } from "../validation/feed.validation";
import _Redis from "../../../config/redis";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";
import { fetchPostsByIds } from "../repository/feed.repository";

/*
 * CONSTANT
 */
const FEED_KEY = (userId: string) => `feed:user:${userId}`;

/*
 * FUNCTION
 */
const GetHomeFeed = async (
  userId: string,
  cursor?: string,
  limit: number = 10
) => {
  try {
    // Validate input
    const { cursor: parsedCursor, limit: parsedLimit } = FeedSchema.parse({
      cursor,
      limit,
    });

    console.log("GetHomeFeed Service:", {
      userId,
      cursor: parsedCursor,
      limit: parsedLimit,
    });

    const startIndex = parsedCursor ? Number(parsedCursor) : 0;
    const endIndex = startIndex + parsedLimit - 1;

    // Read post IDs from Redis sorted set
    const postIds = await _Redis.zrevrange(
      FEED_KEY(userId),
      startIndex,
      endIndex
    );

    console.log("Redis Feed IDs:", postIds);

    if (postIds.length === 0) {
      return {
        message: "No feed posts available",
        status: "EMPTY_FEED",
        edges: [],
        nextCursor: null,
      };
    }

    // Fetch posts from DB
    const posts = await fetchPostsByIds(postIds);

    // Maintain Redis ordering
    const orderedPosts = postIds.map((id) => posts.find((p) => p.id === id));

    const nextCursor =
      postIds.length < parsedLimit ? null : (endIndex + 1).toString();

    return {
      message: "Feed fetched successfully",
      status: "FEED_FETCHED",
      edges: orderedPosts,
      nextCursor,
    };
  } catch (error: any) {
    console.log("GetHomeFeed Service Error:", error);

    // Prisma Error
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);

    // Custom AppError
    if (error instanceof AppError) throw error;

    // Default
    throw new AppError(
      "Unexpected server error (feed)",
      500,
      "INTERNAL_ERROR",
      false
    );
  }
};

/*
 * EXPORT
 */
export default GetHomeFeed;
