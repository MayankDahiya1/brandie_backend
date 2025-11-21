/*
 * IMPORT
 */
import request from "supertest";
import App from "../app";
import Prisma from "../config/prisma";
import type { Application } from "express";

/*
 * VARIABLES
 */
let app: Application;

/*
 * SETUP
 */
beforeAll(async () => {
  app = await App();
});

/*
 * CLEANUP
 */
afterAll(async () => {
  try {
    await Prisma.user.deleteMany({
      where: { email: "test@example.com" },
    });
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await Prisma.$disconnect();
  }
});

/*
 * TESTS
 */
describe("Auth Flow", () => {
  it("should signup and login a user", async () => {
    // SIGN UP
    const signup = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            SignUpUser(email: "test@example.com", password: "pass123", name:"Test User") {
              accessToken
              user { email role }
              status
            }
          }
        `,
      });

    expect(signup.status).toBe(200);
    expect(signup.body.data.SignUpUser.user.email).toBe("test@example.com");
    expect(signup.body.data.SignUpUser.status).toBeDefined();

    // LOGIN
    const login = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            LoginUser(email: "test@example.com", password: "pass123") {
              accessToken
              refreshToken
              user { id email }
            }
          }
        `,
      });

    expect(login.status).toBe(200);
    expect(login.body.data.LoginUser.user.id).toBeDefined();
  });
});
