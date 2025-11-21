/*
 * IMPORT
 */
import { UserIdSchema } from "../validation/follow.validation";
import { findFollowing } from "../repository/follow.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const GetFollowing = async (currentUserId: string) => {
  try {
    const { userId } = UserIdSchema.parse({ userId: currentUserId });

    const _Following = await findFollowing(userId);

    return _Following.map((row) => row.following);
  } catch (error: any) {
    if (error.code?.startsWith("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default GetFollowing;
