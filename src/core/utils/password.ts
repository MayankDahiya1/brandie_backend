/*
 * IMPORTS
 */
import argon2 from "argon2";
import AppError from "../errors/AppError";

/*
 * ARGON2 OPTIONS
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  timeCost: 2,
  memoryCost: 64 * 1024,
  parallelism: 1,
};

/*
 * HASH PASSWORD
 */
const hashPassword = async (password: string): Promise<string> => {
  try {
    if (!password || typeof password !== "string" || password.length < 6) {
      throw new AppError(
        "Password must be at least 6 characters long",
        400,
        "INVALID_PASSWORD"
      );
    }
    const hash = await argon2.hash(password, ARGON2_OPTIONS);
    return hash;
  } catch (error: any) {
    throw new AppError("Password hashing failed", 500, "HASH_ERROR");
  }
};

/*
 * COMPARE PASSWORD
 */
const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    if (!plainPassword || !hashedPassword) return false;
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (error: any) {
    throw new AppError("Password comparison failed", 500, "COMPARE_ERROR");
  }
};

/*
 * EXPORT
 */
export { hashPassword, comparePassword };
