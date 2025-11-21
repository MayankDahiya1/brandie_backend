/*
 * IMPORT
 */
import { z } from "zod";

/*
 * SCHEMAS
 */
const AddCommentSchema = z.object({
  postId: z.string().uuid(),
  text: z.string().min(1).max(500),
});

const DeleteCommentSchema = z.object({
  commentId: z.string().uuid(),
});

/*
 * EXPORT
 */
export { AddCommentSchema, DeleteCommentSchema };
