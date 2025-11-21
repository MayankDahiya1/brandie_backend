/*
 * IMPORT
 */
import { UnfollowSchema } from "../validation/follow.validation";
import { findFollow, deleteFollow } from "../repository/follow.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const UnfollowUser = async (currentUserId: string, targetUserId: string) => {
  try {
    // Validate incoming id
    const { userId } = UnfollowSchema.parse({ userId: targetUserId });

    if (currentUserId === userId) {
      throw new AppError(
        "You cannot unfollow yourself",
        400,
        "SELF_UNFOLLOW_NOT_ALLOWED"
      );
    }

    // Check if following
    const _Exists = await findFollow(currentUserId, userId);

    if (!_Exists) {
      return {
        message: "You are not following this user",
        status: "NOT_FOLLOWING",
      };
    }

    await deleteFollow(currentUserId, userId);

    return {
      message: "User unfollowed successfully",
      status: "UNFOLLOWED_SUCCESSFULLY",
    };
  } catch (error: any) {
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default UnfollowUser;
