/*
 * IMPORT
 */
import { FollowSchema } from "../validation/follow.validation";
import { findFollow, createFollow } from "../repository/follow.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const FollowUser = async (currentUserId: string, targetUserId: string) => {
  try {
    // Validate incoming userId
    const { userId } = FollowSchema.parse({ userId: targetUserId });

    console.log("FollowUser Service: ", {
      currentUserId,
      userId,
    });

    if (currentUserId === userId) {
      throw new AppError(
        "You cannot follow yourself",
        400,
        "SELF_FOLLOW_NOT_ALLOWED"
      );
    }

    // Check if already following
    const _Already = await findFollow(currentUserId, userId);
    if (_Already) {
      return {
        message: "Already following this user",
        status: "ALREADY_FOLLOWING",
      };
    }

    // Create follow relationship
    await createFollow(currentUserId, userId);

    return {
      message: "User followed successfully",
      status: "FOLLOWED_SUCCESSFULLY",
    };
  } catch (error: any) {
    console.log("FollowUser Service Error: ", error);
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default FollowUser;
