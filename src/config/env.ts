/*
 * IMPORT
 */
import dotenv from "dotenv";

/*
 * INITIALIZE
 */
dotenv.config();

// Object
const Config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET as string,
  refreshSecret: process.env.REFRESH_SECRET as string,
  redisUrl: process.env.REDIS_URL as string,
};

/*
 * EXPORT
 */
export default Config;
