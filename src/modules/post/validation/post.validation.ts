/*
 * IMPORT
 */
import { z } from "zod";

/*
 * SCHEMAS
 */
const CreatePostSchema = z.object({
  text: z.string().min(1, "Post text cannot be empty"),
  mediaUrl: z.string().url(),
});

const PaginationSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

/*
 * EXPORT
 */
export { CreatePostSchema, PaginationSchema };
