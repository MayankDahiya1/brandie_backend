/*
 * IMPORT
 */
import { createComment } from "../repository/comment.repository";
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
const AddCommentService = async (
  userId: string,
  postId: string,
  text: string
) => {
  try {
    const post = await Prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    const authorId = post.authorId;

    const newComment = await createComment(postId, userId, text);
    if (!newComment) {
      throw new AppError(
        "Failed to add comment",
        500,
        "COMMENT_CREATION_FAILED"
      );
    }

    const commentCount = await _Redis.incr(`comment:count:${postId}`);

    const newScore = Date.now() + commentCount * 8000;

    await _Redis.zadd(FEED_KEY(authorId), newScore, postId);

    const followers = await findFollowers(authorId);
    for (const f of followers) {
      await _Redis.zadd(FEED_KEY(f.followerId), newScore, postId);
    }

    return {
      message: "Comment added successfully",
      status: "COMMENT_ADDED",
      commentCount,
    };
  } catch (error: any) {
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;

    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR");
  }
};

/*
 * EXPORT
 */
export default AddCommentService;
