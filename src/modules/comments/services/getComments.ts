/*
 * IMPORT
 */
import { fetchComments } from "../repository/comment.repository";
import AppError from "../../../core/errors/AppError";
import PrismaHandler from "../../../core/errors/PrismaHandler";

/*
 * FUNCTION
 */
const GetCommentsService = async (
  postId: string,
  cursor?: string,
  limit: number = 20
) => {
  try {
    const comments = await fetchComments(postId, cursor, limit);

    const nextCursor =
      comments.length === limit ? comments[comments.length - 1].id : null;

    return {
      edges: comments,
      nextCursor,
    };
  } catch (error: any) {
    if (error.code?.startsWith("P20")) throw PrismaHandler(error);
    if (error instanceof AppError) throw error;

    throw new AppError("Unexpected server error", 500, "INTERNAL_ERROR");
  }
};

/*
 * EXPORT
 */
export default GetCommentsService;
