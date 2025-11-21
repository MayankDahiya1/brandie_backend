/*
 * IMPORT
 */
import pino from "pino";

/*
 * CONST ASSIGNMENT
 */
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true, translateTime: true },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

/*
 * EXPORT
 */
export default logger;
