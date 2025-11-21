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

let userA: any; // follower
let userB: any; // target
let tokenA: string;

/*
 * SETUP
 */
beforeAll(async () => {
  app = await App();

  // CLEAN existing users (in case tests ran before)
  await Prisma.user.deleteMany({
    where: {
      email: { in: ["followA@test.com", "followB@test.com"] },
    },
  });

  // CREATE USER A
  const signupA = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          SignUpUser(email:"followA@test.com", password:"pass123", name:"A") {
            accessToken
            user { id email }
          }
        }
      `,
    });

  tokenA = signupA.body.data.SignUpUser.accessToken;
  userA = signupA.body.data.SignUpUser.user;

  // CREATE USER B
  const signupB = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          SignUpUser(email:"followB@test.com", password:"pass123", name:"B") {
            accessToken
            user { id email }
          }
        }
      `,
    });

  userB = signupB.body.data.SignUpUser.user;
});

/*
 * CLEANUP
 */
afterAll(async () => {
  await Prisma.user.deleteMany({
    where: {
      email: { in: ["followA@test.com", "followB@test.com"] },
    },
  });

  await Prisma.$disconnect();
});

/*
 * TEST SUITE
 */
describe("Follow Flow", () => {
  it("should allow user A to follow user B", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            FollowUser(userId: "${userB.id}") {
              message
              status
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.FollowUser.status).toBe("FOLLOWED_SUCCESSFULLY");
  });

  it("should return ALREADY_FOLLOWING when following again", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            FollowUser(userId: "${userB.id}") {
              status
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.FollowUser.status).toBe("ALREADY_FOLLOWING");
  });

  it("should return true for IsFollowing", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          query {
            IsFollowing(userId: "${userB.id}")
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.IsFollowing).toBe(true);
  });

  it("should list user A inside user B's followers", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            Followers(userId: "${userB.id}") {
              id
              email
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    const emails = res.body.data.Followers.map((u: any) => u.email);
    expect(emails).toContain("followA@test.com");
  });

  it("should list user B inside user A's following", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            Following(userId: "${userA.id}") {
              id
              email
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    const emails = res.body.data.Following.map((u: any) => u.email);
    expect(emails).toContain("followB@test.com");
  });

  it("should NOT allow self-follow", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            FollowUser(userId: "${userA.id}") {
              message
              status
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/cannot follow yourself/i);
  });

  it("should allow user A to unfollow B", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            UnfollowUser(userId: "${userB.id}") {
              message
              status
            }
          }
        `,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.UnfollowUser.status).toBe("UNFOLLOWED_SUCCESSFULLY");
  });

  it("should return NOT_FOLLOWING when unfollowing again", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          mutation {
            UnfollowUser(userId: "${userB.id}") {
              status
            }
          }
        `,
      });

    expect(res.body.data.UnfollowUser.status).toBe("NOT_FOLLOWING");
  });
});
