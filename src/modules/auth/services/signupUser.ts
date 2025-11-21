/*
 * IMPORT
 */
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";
import { createUser, findUserByEmail } from "../repository/auth.repository";
import { hashPassword } from "../../../core/utils/password";
import { createAccessToken, createRefreshToken } from "../../../core/utils/jwt";
import _Redis from "../../../config/redis";

/*
 * FUNCTION
 */
const SignupUser = async (email: string, password: string, name?: string) => {
  try {
    // Finding existing email
    const _FindEmail = await findUserByEmail(email);

    // If exsisting
    if (_FindEmail)
      throw new AppError("User already exists", 409, "USER_EXISTS");

    // Hash password
    const _HashedPassword = await hashPassword(password);

    // Creating user
    const _CreateUser = await createUser(email, _HashedPassword, name ?? null);

    // Creating accessToken & refreshToken
    const _AccessToken = createAccessToken(
      {
        id: _CreateUser.id,
        role: _CreateUser.role,
      },
      "15m"
    );

    const _RefreshToken = createRefreshToken(
      {
        id: _CreateUser.id,
        role: _CreateUser.role,
      },
      "7d"
    );

    // Setting refersh token in redis
    await _Redis.set(
      `refresh:${_CreateUser.id}`,
      _RefreshToken,
      "EX",
      7 * 24 * 3600
    );

    // Return
    return {
      user: _CreateUser,
      accessToken: _AccessToken,
      refreshToken: _RefreshToken,
      message: "User Registered Successfully",
      status: "USER_REGISTRED_SUCCESSFULLY",
    };
  } catch (error: any) {
    console.log(error, "signup error");
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
export default SignupUser;
