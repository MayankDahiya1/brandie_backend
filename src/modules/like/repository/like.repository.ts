/*
 * IMPORT
 */
import Prisma from "../../../config/prisma";

/*
 * FUNCTIONS
 */
export const findLike = async (postId: string, userId: string) => {
  return Prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });
};

export const createLike = async (postId: string, userId: string) => {
  return Prisma.like.create({
    data: {
      postId,
      userId,
    },
  });
};

export const deleteLike = async (postId: string, userId: string) => {
  return Prisma.like.deleteMany({
    where: {
      postId,
      userId,
    },
  });
};

export const countLikesDB = async (postId: string) => {
  return Prisma.like.count({
    where: { postId },
  });
};

export const findLikesUsers = async (postId: string) => {
  return Prisma.like.findMany({
    where: { postId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

/*
 * EXPORT
 */
export default {
  findLike,
  createLike,
  deleteLike,
  countLikesDB,
  findLikesUsers,
};
