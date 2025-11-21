/*
 * IMPORT
 */
import { findUserByEmail } from "../repository/auth.repository";
import { comparePassword } from "../../../core/utils/password";
import { createAccessToken, createRefreshToken } from "../../../core/utils/jwt";
import _Redis from "../../../config/redis";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const LoginUser = async (email: string, password: string) => {
  try {
    // Finding user by email
    const _FindUser = await findUserByEmail(email);

    // If user not exsists
    if (!_FindUser)
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTAILS");

    // Comparing password with hashing
    const _Valid = await comparePassword(password, _FindUser.password);

    // If not valid
    if (!_Valid)
      throw new AppError("Invalid credentails", 401, "INVALID_CREDENTAILS");

    // Generating accessToken and refershToken
    const _AccessToken = createAccessToken(
      {
        id: _FindUser.id,
        role: _FindUser.role,
      },
      "15m"
    );

    const _RefreshToken = createRefreshToken(
      {
        id: _FindUser.id,
        role: _FindUser.role,
      },
      "7d"
    );

    // Setting refersh token in redis
    await _Redis.set(
      `refresh:${_FindUser.id}`,
      _RefreshToken,
      "EX",
      7 * 24 * 3600
    );

    // Return
    return {
      user: _FindUser,
      accessToken: _AccessToken,
      refreshToken: _RefreshToken,
      message: "User Registered Successfully",
      status: "USER_REGISTRED_SUCCESSFULLY",
    };
  } catch (error: any) {
    // Prisma error
    if (error.code?.startsWith?.("P20")) throw PrismaHandler(error);
    // Redis error
    if (error?.name === "RedisError")
      throw new AppError("Cache layer unavailable", 503, "REDIS_UNAVAILABLE");
    // Normal Error
    if (error instanceof AppError) throw error;
    // Server error
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default LoginUser;
