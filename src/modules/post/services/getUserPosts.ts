/*
 * IMPORT
 */
import { PaginationSchema } from "../validation/post.validation";
import { findUserPosts } from "../repository/post.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const GetUserPostsService = async (
  userId: string,
  limit: number,
  offset: number
) => {
  try {
    const { limit: _Limit, offset: _Offset } = PaginationSchema.parse({
      limit,
      offset,
    });

    return await findUserPosts(userId, _Limit, _Offset);
  } catch (error: any) {
    if (error.code?.startsWith("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default GetUserPostsService;
