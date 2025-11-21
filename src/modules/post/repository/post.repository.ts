/*
 * IMPORT
 */
import prisma from "../../../config/prisma";

/*
 * FUNCTIONS
 */
export const createPost = async (
  authorId: string,
  text: string,
  mediaUrl: string
) => {
  return prisma.post.create({
    data: {
      authorId,
      text,
      mediaUrl,
    },
    include: {
      author: true,
    },
  });
};

export const findMyPosts = async (
  authorId: string,
  limit: number,
  offset: number
) => {
  return prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: { author: true },
  });
};

export const findUserPosts = async (
  userId: string,
  limit: number,
  offset: number
) => {
  return prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: { author: true },
  });
};

export const findFeedPosts = async (
  authorIds: string[],
  limit: number,
  offset: number
) => {
  return prisma.post.findMany({
    where: { authorId: { in: authorIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: { author: true },
  });
};

/*
 * EXPORT
 */
export default {
  createPost,
  findMyPosts,
  findUserPosts,
  findFeedPosts,
};
