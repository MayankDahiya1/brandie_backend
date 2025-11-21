/*
 * IMPORTS
 */
import request from "supertest";
import App from "../app";
import Prisma from "../config/prisma";
import type { Application } from "express";

/*
 * VARIABLES
 */
let app: Application;

let tokenA: string;
let userA: any;
let postA: any;

let createdCommentId: string;

/*
 * SETUP
 */
beforeAll(async () => {
  app = await App();

  // Create user A
  const signup = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          SignUpUser(
            email: "commentA@test.com",
            password: "pass123"
          ) {
            accessToken
            user { id email }
          }
        }
      `,
    });

  tokenA = signup.body?.data?.SignUpUser?.accessToken;
  userA = signup.body?.data?.SignUpUser?.user;

  // Create a Post by user A
  const createPost = await request(app)
    .post("/graphql")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({
      query: `
        mutation {
          CreatePost(text: "This is a comment test", mediaUrl: "https://example.com/image.jpg") {
            post { id }
          }
        }
      `,
    });

  postA = createPost.body?.data?.CreatePost?.post;
});

/*
 * CLEANUP
 */
afterAll(async () => {
  try {
    if (userA?.id) {
      await Prisma.comment.deleteMany({ where: { userId: userA.id } });
      await Prisma.post.deleteMany({ where: { authorId: userA.id } });
      await Prisma.user.deleteMany({ where: { email: "commentA@test.com" } });
    }
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await Prisma.$disconnect();
  }
});

/*
 * TESTS
 */
describe("Comment Flow", () => {
  // 1️⃣ Add Comment
  it("should allow user A to add a comment", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            AddComment(postId: "${postA.id}", text: "Nice post!") {
              status
              message
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.AddComment.status).toBe("COMMENT_ADDED");

    // fetch comments to store commentId
    const get = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            GetComments(postId: "${postA.id}") {
              edges { id text }
            }
          }
        `,
      });

    createdCommentId = get.body.data.GetComments.edges[0].id;
    expect(createdCommentId).toBeDefined();
  });

  // 2️⃣ Get Comments
  it("should get comments for the post", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            GetComments(postId: "${postA.id}") {
              edges { id text }
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.GetComments.edges)).toBe(true);
    expect(res.body.data.GetComments.edges[0].text).toBe("Nice post!");
  });

  // 3️⃣ Comment Count
  it("should return correct comment count", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            GetCommentCount(postId: "${postA.id}")
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.GetCommentCount).toBeGreaterThanOrEqual(1);
  });

  // 4️⃣ Delete Comment
  it("should allow user A to delete comment", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            DeleteComment(commentId: "${createdCommentId}") {
              status
              message
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.DeleteComment.status).toBe("COMMENT_DELETED");
  });

  // 5️⃣ Deleting Again Should Throw NOT_FOUND
  it("should return NOT_FOUND when deleting again", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            DeleteComment(commentId: "${createdCommentId}") {
              status
              message
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not found/i);
  });
});
