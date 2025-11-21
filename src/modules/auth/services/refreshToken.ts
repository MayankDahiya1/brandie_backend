/*
 * IMPORT
 */
import { createAccessToken } from "../../../core/utils/jwt";
import Redis from "../../../config/redis";
import AppError from "../../../core/errors/AppError";

/*
 * FUNCTION
 */
const RefreshToken = async (userId: string, token: string) => {
  try {
    // Finding if refresh token exsists or not
    const _Stored = await Redis.get(`refresh:${userId}`);

    // If not stored throw an error
    if (!_Stored) throw new AppError("Session expired", 401, "SESSION_EXPIRED");

    // If token doesn't matches
    if (_Stored !== token)
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH");

    // Generating new accesstoken
    const _NewAccessToken = createAccessToken({ id: userId }, "15m");

    // Return new accesstoken
    return {
      accessToken: _NewAccessToken,
      status: "NEW_ACCESS_TOKEN_GENERATED",
      message: "Access token generated successfully",
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    if (err.name === "RedisError")
      throw new AppError("Cache layer unavailable", 503, "REDIS_UNAVAILABLE");
    throw new AppError(
      "Unexpected refresh error",
      500,
      "INTERNAL_ERROR",
      false
    );
  }
};

/*
 * EXPORT
 */
export default RefreshToken;
