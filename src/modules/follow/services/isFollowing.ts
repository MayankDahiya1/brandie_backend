/*
 * IMPORT
 */
import { UserIdSchema } from "../validation/follow.validation";
import { findFollow } from "../repository/follow.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const IsFollowingService = async (
  currentUserId: string,
  targetUserId: string
) => {
  try {
    const { userId } = UserIdSchema.parse({ userId: targetUserId });

    if (currentUserId === userId) return false;

    const _Exists = await findFollow(currentUserId, userId);

    return !!_Exists;
  } catch (error: any) {
    if (error.code?.startsWith("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default IsFollowingService;
