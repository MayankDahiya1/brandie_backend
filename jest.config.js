/** @type {import('ts-jest').JestConfigWithTsJest} */
require("dotenv").config({ path: ".env" });
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/jest.setup.js"],
};
