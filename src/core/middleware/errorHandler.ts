/*
 * IMPORT
 */
import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/*
 * FUNCTION
 */
const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";

  logger.error({
    message: err.message,
    code,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    code,
  });
};

/*
 * EXPORT
 */
export default errorHandler;
