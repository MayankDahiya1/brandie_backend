/*
 * IMPORT
 */
import { findLike, deleteLike } from "../repository/like.repository";
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
const UnlikePostService = async (userId: string, postId: string) => {
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

    if (!userInSet) {
      return { message: "Not liked", status: "NOT_LIKED" };
    }

    const multi = _Redis.multi();
    multi.srem(`like:user:${postId}`, userId);
    multi.decr(`like:count:${postId}`);
    const results = await multi.exec();

    const likeCount = Math.max(0, Number(results?.[1][1] ?? 0));

    const existing = await findLike(postId, userId);
    if (existing) {
      await deleteLike(postId, userId);
    }

    const newScore = Date.now() + likeCount * 5000;

    await _Redis.zadd(FEED_KEY(authorId), newScore, postId);

    const followers = await findFollowers(authorId);
    for (const f of followers) {
      await _Redis.zadd(FEED_KEY(f.followerId), newScore, postId);
    }

    return {
      message: "Post unliked successfully",
      status: "UNLIKED_SUCCESSFULLY",
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
export default UnlikePostService;
