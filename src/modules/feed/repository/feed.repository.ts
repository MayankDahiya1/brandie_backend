/*
 * IMPORT
 */
import Prisma from "../../../config/prisma";

/*
 * FUNCTIONS
 */
export const fetchPostsByIds = async (ids: string[]) => {
  return Prisma.post.findMany({
    where: { id: { in: ids } },
    include: {
      author: true,
    },
  });
};

/*
 * EXPORT
 */
export default {
  fetchPostsByIds,
};
