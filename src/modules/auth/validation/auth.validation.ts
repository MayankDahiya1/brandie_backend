/*
 * IMPORT
 */
import { z } from "zod";

/*
 * FUNCTIONS
 */
const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/*
 * EXPORT
 */
export { SignupSchema, LoginSchema };
