/*
 * IMPORT
 */
import _Redis from "../../../config/redis";
import { findLike } from "../repository/like.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const HasLikedService = async (userId: string, postId: string) => {
  try {
    const inSet = await _Redis.sismember(`like:user:${postId}`, userId);
    if (inSet) return true;

    // fallback DB
    const existing = await findLike(postId, userId);
    return !!existing;
  } catch (error: any) {
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default HasLikedService;
