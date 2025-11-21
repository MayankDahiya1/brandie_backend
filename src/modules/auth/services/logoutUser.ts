/*
 * IMPORT
 */
import { invalidateToken } from "../../../core/utils/jwt";
import _Redis from "../../../config/redis";
import AppError from "../../../core/errors/AppError";

/*
 * FUNCTION
 */
const LogoutUser = async (userId: string, token: string, exp: number) => {
  try {
    // Invalidating token
    await invalidateToken(token, exp);

    // Deleting token
    await _Redis.del(`refresh:${userId}`);

    // If deletion successfull
    return {
      message: "Logged out successfully",
      status: "LOGGED_OUT",
    };
  } catch (error: any) {
    // If redis error occurs
    if (error?.name === "RedisError")
      throw new AppError("Cache layer unavailable", 503, "REDIS_UNAVAILABLE");

    if (error instanceof AppError) throw error;

    throw new AppError("Unexpected logout failure", 500, "LOGOUT_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default LogoutUser;
