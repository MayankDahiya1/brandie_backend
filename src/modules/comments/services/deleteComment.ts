/*
 * IMPORT
 */
import {
  findCommentById,
  deleteCommentDB,
} from "../repository/comment.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";
import Prisma from "../../../config/prisma";
import _Redis from "../../../config/redis";
import { findFollowers } from "../../follow/repository/follow.repository";

/*
 * CONSTANT
 */
const FEED_KEY = (userId: string) => `feed:user:${userId}`;

/*
 * FUNCTION
 */
const DeleteCommentService = async (userId: string, commentId: string) => {
  try {
    const comment = await findCommentById(commentId);

    if (!comment) throw new AppError("Comment not found", 404, "NOT_FOUND");
    if (comment.userId !== userId)
      throw new AppError("Not allowed", 403, "FORBIDDEN");

    const postId = comment.postId;

    const post = await Prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    const authorId = post.authorId;

    await deleteCommentDB(commentId, userId);

    const commentCount = Math.max(
      0,
      Number(await _Redis.decr(`comment:count:${postId}`))
    );

    const newScore = Date.now() + commentCount * 8000;

    await _Redis.zadd(FEED_KEY(authorId), newScore, postId);

    const followers = await findFollowers(authorId);
    for (const f of followers) {
      await _Redis.zadd(FEED_KEY(f.followerId), newScore, postId);
    }

    return {
      message: "Comment deleted successfully",
      status: "COMMENT_DELETED",
      commentCount,
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
export default DeleteCommentService;
