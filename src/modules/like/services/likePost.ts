/*
 * IMPORT
 */
import { findLike, createLike } from "../repository/like.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";
import _Redis from "../../../config/redis";
import Prisma from "../../../config/prisma";
import { findFollowers } from "../../follow/repository/follow.repository";

/*
 * CONSTANT
 */
const FEED_KEY = (userId: string) => `feed:user:${userId}`;

/*
 * FUNCTION
 */
const LikePostService = async (userId: string, postId: string) => {
  try {
    const post = await Prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    const authorId = post.authorId;

    const userInSet = await _Redis.sismember(`like:user:${postId}`, userId);
    if (userInSet) {
      return { message: "Already liked", status: "ALREADY_LIKED" };
    }

    const multi = _Redis.multi();
    multi.sadd(`like:user:${postId}`, userId);
    multi.incr(`like:count:${postId}`);
    const execRes = await multi.exec();
    const likeCount = Number(execRes?.[1][1] ?? 0);

    // 4) DB mirror
    const existing = await findLike(postId, userId);
    if (!existing) {
      await createLike(postId, userId);
    }

    const newScore = Date.now() + likeCount * 5000;

    await _Redis.zadd(FEED_KEY(authorId), newScore, postId);

    // Update followers feed
    const followers = await findFollowers(authorId);
    for (const f of followers) {
      await _Redis.zadd(FEED_KEY(f.followerId), newScore, postId);
    }

    return {
      message: "Post liked successfully",
      status: "LIKED_SUCCESSFULLY",
      likeCount,
    };
  } catch (error: any) {
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;

    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default LikePostService;
