/*
 * IMPORT
 */
import { Prisma } from "../../generated/prisma/client";
import AppError from "./AppError";

/*
 * FUNCTION
 */
const PrismaHandler = (err: any) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return new AppError("Duplicate record", 409, "PRISMA_DUPLICATE");
      case "P2003":
        return new AppError("Foreign key constraint failed", 400, "PRISMA_FK");
      default:
        return new AppError(
          `Database error (${err.code})`,
          500,
          "PRISMA_UNKNOWN"
        );
    }
  }
  return new AppError("Database operation failed", 500, "DB_ERROR", false);
};

/*
 * EXPORT
 */
export default PrismaHandler;
