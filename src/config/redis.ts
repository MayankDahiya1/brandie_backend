/*
 * IMPORT
 */
import { Redis } from "ioredis";
import CONFIG from "./env";

// INITIALIZE
const _Redis = new Redis(CONFIG.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

/*
 * EXPORT
 */
export default _Redis;
