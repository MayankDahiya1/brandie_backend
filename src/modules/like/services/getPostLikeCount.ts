/*
 * IMPORT
 */
import _Redis from "../../../config/redis";
import { countLikesDB } from "../repository/like.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const GetPostLikeCountService = async (postId: string) => {
  try {
    const countKey = `like:count:${postId}`;
    const val = await _Redis.get(countKey);

    if (val !== null) return Number(val);

    // Fallback to DB and set cache
    const dbCount = await countLikesDB(postId);
    await _Redis.set(countKey, String(dbCount));
    return dbCount;
  } catch (error: any) {
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default GetPostLikeCountService;
