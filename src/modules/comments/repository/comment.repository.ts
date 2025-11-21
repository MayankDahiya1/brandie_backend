/*
 * IMPORT
 */
import Prisma from "../../../config/prisma";

/*
 * FUNCTIONS
 */
export const createComment = async (
  postId: string,
  userId: string,
  text: string
) => {
  return Prisma.comment.create({
    data: { postId, userId, text },
  });
};

export const findCommentById = async (commentId: string) => {
  return Prisma.comment.findUnique({
    where: { id: commentId },
    include: { user: true },
  });
};

export const deleteCommentDB = async (commentId: string, userId: string) => {
  return Prisma.comment.deleteMany({
    where: { id: commentId, userId },
  });
};

export const fetchComments = async (
  postId: string,
  cursor?: string,
  limit: number = 20
) => {
  return Prisma.comment.findMany({
    where: { postId },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
};

export const countCommentsDB = async (postId: string) => {
  return Prisma.comment.count({
    where: { postId },
  });
};

/*
 * EXPORT
 */
export default {
  createComment,
  findCommentById,
  deleteCommentDB,
  fetchComments,
  countCommentsDB,
};
