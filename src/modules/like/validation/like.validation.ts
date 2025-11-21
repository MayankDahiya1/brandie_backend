/*
 * IMPORT
 */
import { z } from "zod";

/*
 * SCHEMAS
 */
const PostIdSchema = z.object({
  postId: z.string().uuid(),
});

/*
 * EXPORT
 */
export { PostIdSchema };
