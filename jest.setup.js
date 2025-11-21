// Load .env before anything else
const path = require("path");
const dotenvPath = path.resolve(__dirname, ".env");

require("dotenv").config({ path: dotenvPath });

console.log("✅ Jest loaded .env file");
console.log("DATABASE_URL:", process.env.DATABASE_URL);
