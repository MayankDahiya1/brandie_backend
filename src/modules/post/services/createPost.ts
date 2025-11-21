/*
 * IMPORT
 */
import { CreatePostSchema } from "../validation/post.validation";
import { createPost } from "../repository/post.repository";
import { findFollowers } from "../../follow/repository/follow.repository";
import _Redis from "../../../config/redis";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * CONSTANT
 */
const FEED_KEY = (userId: string) => `feed:user:${userId}`;

/*
 * FUNCTION
 */
const CreatePostService = async (
  authorId: string,
  text: string,
  mediaUrl: string
) => {
  try {
    const { text: _Text, mediaUrl: _MediaUrl } = CreatePostSchema.parse({
      text,
      mediaUrl,
    });

    // create post
    const _Post = await createPost(authorId, _Text, _MediaUrl);

    // update feeds
    const _Followers = await findFollowers(authorId);

    // get current timestamp
    const _Timestamp = Date.now();

    // add to author's feed
    await _Redis.zadd(FEED_KEY(authorId), _Timestamp, _Post.id);

    // add to followers' feeds
    for (const f of _Followers) {
      await _Redis.zadd(FEED_KEY(f.followerId), _Timestamp, _Post.id);
    }

    // return response
    return {
      post: _Post,
      message: "Post created successfully",
      status: "POST_CREATED_SUCCESSFULLY",
    };
  } catch (error: any) {
    if (error.code?.startsWith("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;
    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR", false);
  }
};

/*
 * EXPORT
 */
export default CreatePostService;
