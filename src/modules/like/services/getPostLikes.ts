/*
 * IMPORT
 */
import { findLikesUsers } from "../repository/like.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const GetPostLikesService = async (postId: string) => {
  try {
    const _Likes = await findLikesUsers(postId);
    // return user objects
    return _Likes.map((r) => r.user);
  } catch (error: any) {
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default GetPostLikesService;
