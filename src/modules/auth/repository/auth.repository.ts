/*
 * IMPORTS
 */
import Prisma from "../../../config/prisma";

/*
 * FUNCTIONS
 */
const findUserByEmail = (email: string) =>
  Prisma.user.findUnique({
    where: {
      email,
    },
  });

const createUser = (email: string, password: string, name: string | null) =>
  Prisma.user.create({ data: { email, password, name } });

/*
 * EXPORT
 */
export { findUserByEmail, createUser };
