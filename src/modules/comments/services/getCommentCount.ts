/*
 * IMPORT
 */
import _Redis from "../../../config/redis";
import { countCommentsDB } from "../repository/comment.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const GetCommentCountService = async (postId: string) => {
  try {
    const key = `comment:count:${postId}`;
    const cached = await _Redis.get(key);

    if (cached !== null) return Number(cached);

    const dbCount = await countCommentsDB(postId);
    await _Redis.set(key, dbCount);

    return dbCount;
  } catch (error: any) {
    if (error.code?.startsWith("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;

    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR");
  }
};

/*
 * EXPORT
 */
export default GetCommentCountService;
