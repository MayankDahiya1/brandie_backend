/*
 * IMPORT
 */
import App from "./app";
import Prisma from "./config/prisma";
import Redis from "./config/redis";
import Config from "./config/env";
import logger from "./core/utils/logger";

/*
 * FUNCTION
 */
const StartServer = async () => {
  try {
    // Connect DB
    await Prisma.$connect();
    logger.info("Database connected");

    // Connect Redis
    await Redis.ping();
    logger.info("Redis connected");

    // Create app
    const _App = await App();

    const server = _App.listen(Config.port, () => {
      logger.info(`Server running at http://localhost:${Config.port}/graphql`);
    });

    // Graceful shutdown
    const Shutdown = async () => {
      logger.warn("Shutting down server gracefully...");
      await Prisma.$disconnect();
      Redis.disconnect();
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", Shutdown);
    process.on("SIGTERM", Shutdown);
  } catch (err: any) {
    logger.error(err, "Startup failed");
    process.exit(1);
  }
};

/*
 * SERVER START
 */
StartServer();
