/*
 * IMPORT
 */
import Prisma from "../../../config/prisma";

/*
 * FUNCTION
 */
export const findFollow = async (followerId: string, followingId: string) => {
  return Prisma.follow.findFirst({
    where: {
      followerId,
      followingId,
    },
  });
};

export const createFollow = async (followerId: string, followingId: string) => {
  return Prisma.follow.create({
    data: {
      followerId,
      followingId,
    },
  });
};

export const deleteFollow = async (followerId: string, followingId: string) => {
  return Prisma.follow.deleteMany({
    where: {
      followerId,
      followingId,
    },
  });
};

export const findFollowers = async (userId: string) => {
  return Prisma.follow.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: true,
    },
  });
};

export const findFollowing = async (userId: string) => {
  return Prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: true,
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return Prisma.user.findUnique({
    where: { email },
  });
};

/*
 * EXPORT
 */
export default {
  findFollow,
  createFollow,
  deleteFollow,
  findFollowers,
  findFollowing,
  findUserByEmail,
};
