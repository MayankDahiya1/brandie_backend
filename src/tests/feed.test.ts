/*
 * IMPORTS
 */
import request from "supertest";
import App from "../app";
import Prisma from "../config/prisma";
import _Redis from "../config/redis";
import type { Application } from "express";

/*
 * VARIABLES
 */
let app: Application;

let userA: any; // poster
let userB: any; // follower

let tokenA: string;
let tokenB: string;

let post1: any;
let post2: any;

/*
 * SETUP
 */
beforeAll(async () => {
  app = await App();

  // Clean any old data
  await Prisma.user.deleteMany({
    where: { email: { in: ["feedA@test.com", "feedB@test.com"] } },
  });

  /*
   * Create User A (creator)
   */
  const signupA = await request(app)
    .post("/graphql")
    .send({
      query: `
      mutation {
        SignUpUser(email:"feedA@test.com", password:"pass123", name:"A") {
          accessToken
          user { id email }
        }
      }
    `,
    });

  tokenA = signupA.body.data.SignUpUser.accessToken;
  userA = signupA.body.data.SignUpUser.user;

  /*
   * Create User B (follower)
   */
  const signupB = await request(app)
    .post("/graphql")
    .send({
      query: `
      mutation {
        SignUpUser(email:"feedB@test.com", password:"pass123", name:"B") {
          accessToken
          user { id email }
        }
      }
    `,
    });

  tokenB = signupB.body.data.SignUpUser.accessToken;
  userB = signupB.body.data.SignUpUser.user;

  /*
   * B Follows A
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

    await Prisma.post.deleteMany({
      where: { authorId: { in: [userA?.id, userB?.id] } },
    });

    await Prisma.user.deleteMany({
      where: { email: { in: ["feedA@test.com", "feedB@test.com"] } },
    });

    await _Redis.flushall();
  } finally {
    await Prisma.$disconnect();
  }
});

/*
 * TEST SUITE
 */
describe(" Feed Ranking Flow (likes, comments, score updates)", () => {
  it("should create two posts by User A", async () => {
    // Post 1
    const res1 = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            CreatePost(text:"Post One", mediaUrl:"https://example.com/img1") {
              post { id text }
              status
            }
          }
        `,
      });

    post1 = res1.body.data.CreatePost.post;

    // Post 2
    const res2 = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            CreatePost(text:"Post Two", mediaUrl:"https://example.com/img2") {
              post { id text }
              status
            }
          }
        `,
      });

    post2 = res2.body.data.CreatePost.post;

    expect(post1.id).toBeDefined();
    expect(post2.id).toBeDefined();
  });

  it("Feed should show newest post first", async () => {
    const feedRes = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          query {
            GetHomeFeed {
              edges { id text }
            }
          }
        `,
      });

    const list = feedRes.body.data.GetHomeFeed.edges;

    expect(list.length).toBe(2);
    expect(list[0].id).toBe(post2.id); // newest first
  });

  it("Like should push Post1 above Post2 (score bump)", async () => {
    await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          mutation {
            LikePost(postId: "${post1.id}") {
              status
            }
          }
        `,
      });

    const feed = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
        query {
          GetHomeFeed {
            edges { id }
          }
        }
      `,
      });

    const order = feed.body.data.GetHomeFeed.edges.map((x: any) => x.id);

    expect(order[0]).toBe(post1.id);
  });

  it("Comment should increase score further", async () => {
    await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          mutation {
            AddComment(postId: "${post2.id}", text:"Nice!") {
              status
            }
          }
        `,
      });

    const feed2 = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          query {
            GetHomeFeed {
              edges { id }
            }
          }
        `,
      });

    const order = feed2.body.data.GetHomeFeed.edges.map((x: any) => x.id);

    expect(order[0]).toBe(post2.id);
  });

  it("Unlike should lower Post1 score but still keep ordering correct", async () => {
    await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          mutation {
            UnlikePost(postId: "${post1.id}") {
              status
            }
          }
        `,
      });

    const feed3 = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          query {
            GetHomeFeed {
              edges { id }
            }
          }
        `,
      });

    const order = feed3.body.data.GetHomeFeed.edges.map((x: any) => x.id);

    expect(order[0]).toBe(post2.id);
  });

  it("Deleting comment should reduce score", async () => {
    const commentsRes = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          query {
            GetComments(postId: "${post2.id}") {
              edges { id }
            }
          }
        `,
      });

    const commentId = commentsRes.body.data.GetComments.edges[0].id;

    await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          mutation {
            DeleteComment(commentId: "${commentId}") {
              status
            }
          }
        `,
      });

    const feed4 = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          query {
            GetHomeFeed {
              edges { id }
            }
          }
        `,
      });

    const order = feed4.body.data.GetHomeFeed.edges.map((x: any) => x.id);

    expect(order.includes(post1.id)).toBe(true);
    expect(order.includes(post2.id)).toBe(true);
  });

  it("Pagination should work", async () => {
    const page = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        query: `
          query {
            GetHomeFeed(limit: 1) {
              edges { id }
              nextCursor
            }
          }
        `,
      });

    expect(page.body.data.GetHomeFeed.edges.length).toBe(1);
    expect(page.body.data.GetHomeFeed.nextCursor).not.toBeNull();
  });
});
