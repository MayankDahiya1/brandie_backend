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

let userA: any; // will create posts
let userB: any; // follower

let tokenA: string;
let tokenB: string;

let createdPostId: string;

/*
 * SETUP
 */
beforeAll(async () => {
  app = await App();

  // CLEANUP any leftover test data
  await Prisma.user.deleteMany({
    where: {
      email: { in: ["postA@test.com", "postB@test.com"] },
    },
  });

  /*
   * CREATE USER A
   */
  const signupA = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          SignUpUser(email:"postA@test.com", password:"pass123", name:"A") {
            accessToken
            user { id email }
          }
        }
      `,
    });

  tokenA = signupA.body.data.SignUpUser.accessToken;
  userA = signupA.body.data.SignUpUser.user;

  /*
   * CREATE USER B
   */
  const signupB = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          SignUpUser(email:"postB@test.com", password:"pass123", name:"B") {
            accessToken
            user { id email }
          }
        }
      `,
    });

  tokenB = signupB.body.data.SignUpUser.accessToken;
  userB = signupB.body.data.SignUpUser.user;

  /*
   * LET B FOLLOW A (for feed tests)
   */
  await request(app)
    .post("/graphql")
    .set("Authorization", `Bearer ${tokenB}`)
    .send({
      query: `
        mutation {
          FollowUser(userId: "${userA.id}") {
            status
          }
        }
      `,
    });
});

/*
 * CLEANUP
 */
afterAll(async () => {
  try {
    // 1) Delete follow relationships first
    await Prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: userA?.id },
          { followingId: userA?.id },
          { followerId: userB?.id },
          { followingId: userB?.id },
        ],
      },
    });

    // 2) Delete posts
    await Prisma.post.deleteMany({
      where: {
        authorId: { in: [userA?.id, userB?.id] },
      },
    });

    // 3) Delete users
    await Prisma.user.deleteMany({
      where: {
        email: { in: ["postA@test.com", "postB@test.com"] },
      },
    });
  } finally {
    await Prisma.$disconnect();
  }
});

/*
 * TEST SUITE
 */
describe("Post Module", () => {
  it("should allow User A to create a post", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            CreatePost(text: "Hello World!", mediaUrl: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pinterest.com%2Frarome%2Fbadass-batman-images%2F&psig=AOvVaw0ythQ0rte4iQX-2phtXAXM&ust=1763807126888000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIDEndyDg5EDFQAAAAAdAAAAABAV") {
              post { id text author { id email } }
              status
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.CreatePost.status).toBe("POST_CREATED_SUCCESSFULLY");
    expect(res.body.data.CreatePost.post.text).toBe("Hello World!");

    createdPostId = res.body.data.CreatePost.post.id;
  });

  it("should return User A's posts via MyPosts", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          query {
            MyPosts {
              id
              text
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    const posts = res.body.data.MyPosts;

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.some((p: any) => p.id === createdPostId)).toBe(true);
  });

  it("should return User A's posts via UserPosts", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            UserPosts(userId: "${userA.id}") {
              id
              text
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    const posts = res.body.data.UserPosts;

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.some((p: any) => p.id === createdPostId)).toBe(true);
  });

  it("should respect pagination (limit=1)", async () => {
    // Create additional posts for pagination test
    await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            CreatePost(text: "Another post", mediaUrl: "https://example.com/image.jpg") {
              status
            }
          }
        `,
      });

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          query {
            MyPosts(limit: 1) {
              id
              text
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    const posts = res.body.data.MyPosts;

    expect(posts.length).toBe(1);
  });
});
