/*
 * IMPORT
 */
import { PrismaClient, Role } from "../generated/prisma/client";

/*
 * INITIALIZE
 */
const Prisma = new PrismaClient();

/*
 * EXPORT
 */
export { Role };
export default Prisma;
