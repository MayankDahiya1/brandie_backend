/*
 * IMPORT
 */
import { z } from "zod";

/*
 * FEED VALIDATION
 */
export const FeedSchema = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});
