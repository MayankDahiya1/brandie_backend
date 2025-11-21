/*
 * IMPORT
 */
import { UserIdSchema } from "../validation/follow.validation";
import { findFollowers } from "../repository/follow.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const GetFollowers = async (targetUserId: string) => {
  try {
    const { userId } = UserIdSchema.parse({ userId: targetUserId });

    const _Followers = await findFollowers(userId);

    return _Followers.map((row) => row.follower);
  } catch (error: any) {
    if (error.code?.startsWith("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default GetFollowers;
