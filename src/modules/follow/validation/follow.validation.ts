/*
 * IMPORT
 */
import { z } from "zod";

/*
 * SCHEMAS
 */
const FollowSchema = z.object({
  userId: z.string().uuid(),
});

const UnfollowSchema = z.object({
  userId: z.string().uuid(),
});

const UserIdSchema = z.object({
  userId: z.string().uuid(),
});

/*
 * EXPORT
 */
export { FollowSchema, UnfollowSchema, UserIdSchema };
