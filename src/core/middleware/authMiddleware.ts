/*
 * IMPORT
 */
import type { Response, NextFunction } from "express";
import { verifyAcessToken } from "../utils/jwt";

/*
 * MIDDLEWARE
 */
const AuthMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAcessToken(token);
      req.user = decoded;
    } catch (err) {
      // Invalid token — but don’t reject globally
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

/*
 * EXPORT
 */
export default AuthMiddleware;
