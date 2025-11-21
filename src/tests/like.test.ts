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

/*
 * SETUP
 */
beforeAll(async () => {
  app = await App();

  // create user A
  const s1 = await request(app)
    .post("/graphql")
    .send({
      query: `
      mutation {
        SignUpUser(email:"likeA@test.com", password:"pass123", name:"A") {
          accessToken
          user { id email }
        }
      }
    `,
    });

  tokenA = s1.body.data.SignUpUser.accessToken;
  userA = s1.body.data.SignUpUser.user;

  // create a post by A
  const p = await request(app)
    .post("/graphql")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({
      query: `
        mutation {
          CreatePost(text: "Like test", mediaUrl: "https://example.com/image.jpg") {
            post { id }
          }
        }
      `,
    });

  postA = p.body.data.CreatePost.post;
});

/*
 * CLEANUP
 */
afterAll(async () => {
  await Prisma.like.deleteMany({ where: { userId: userA?.id } });
  await Prisma.post
    .deleteMany({ where: { authorId: userA?.id } })
    .catch(() => {});
  await Prisma.user.deleteMany({ where: { email: "likeA@test.com" } });
  await Prisma.$disconnect();
});

/*
 * TESTS
 */
describe("Like Flow", () => {
  it("should like a post", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            LikePost(postId: "${postA.id}") {
              status
              message
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.LikePost.status).toBe("LIKED_SUCCESSFULLY");
  });

  it("should return like count and hasLiked", async () => {
    const count = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            GetPostLikeCount(postId: "${postA.id}")
          }
        `,
      });

    expect(count.body.data.GetPostLikeCount).toBeGreaterThanOrEqual(1);

    const liked = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          query {
            HasLiked(postId: "${postA.id}")
          }
        `,
      });

    expect(liked.body.data.HasLiked).toBe(true);
  });

  it("should unlike the post", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            UnlikePost(postId: "${postA.id}") {
              status
            }
          }
        `,
      });

    expect(res.body.data.UnlikePost.status).toBe("UNLIKED_SUCCESSFULLY");
  });
});
