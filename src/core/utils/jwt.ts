/*
 * IMPORT
 */
import jwt, { Secret, SignOptions } from "jsonwebtoken";

/*
 * HELPERS
 */
import config from "../../config/env";
import redis from "../../config/redis";

/*
 * EXPORT
 */
export const createAccessToken = (
  payload: object,
  expiresIn: string | number
) => {
  return jwt.sign(
    payload,
    config.jwtSecret as Secret,
    { expiresIn } as SignOptions
  );
};

export const createRefreshToken = (
  payload: object,
  expiresIn: string | number
) => {
  return jwt.sign(
    payload,
    config.refreshSecret as Secret,
    { expiresIn } as SignOptions
  );
};

export const verifyAcessToken = (token: string) =>
  jwt.verify(token, config.jwtSecret);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, config.refreshSecret);

export const invalidateToken = async (token: string, exp: number) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.setex(`bl:${token}`, ttl, "1");
};

export const isTokenBlacklisted = async (token: string) => {
  const result = await redis.get(`bl:${token}`);
  return result === "1";
};
