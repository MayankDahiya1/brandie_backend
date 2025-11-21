/*
 * EXPORT
 */
export default class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  constructor(
    message: string,
    statusCode = 400,
    code = "APP_ERROR",
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
