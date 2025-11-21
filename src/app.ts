/*
 * IMPORTS
 */
import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { ApolloServer } from "apollo-server-express";
import type { GraphQLFormattedError } from "graphql";
import schema from "./schema";
import authMiddleware from "./core/middleware/authMiddleware";
import logger from "./core/utils/logger";
import AppError from "./core/errors/AppError";
import errorHandler from "./core/middleware/errorHandler";

/*
 * FUNCTION
 */
const CreateApp = async (): Promise<Application> => {
  // Express App Init
  const _App: Application = express();

  // Environment check
  const isProd = process.env.NODE_ENV === "production";

  /*
   * CORE SECURITY MIDDLEWARES
   */
  _App.use(
    helmet(
      isProd
        ? undefined
        : {
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
          }
    )
  );

  _App.use(
    cors({
      origin: isProd ? process.env.ALLOWED_ORIGIN || "*" : "*",
      credentials: true,
    })
  );

  _App.use(compression());

  if (isProd) {
    _App.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 200,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  /*
   * LOGGING
   */
  _App.use(
    morgan(isProd ? "combined" : "dev", {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );

  /*
   * AUTH CONTEXT (Attach JWT decoded user)
   */
  _App.use(authMiddleware);

  /*
   * HEALTH CHECK
   */
  _App.get("/health", (_req, res) =>
    res.status(200).json({ status: "OK", env: process.env.NODE_ENV })
  );

  /*
   * APOLLO SERVER INIT
   */

  const _Apollo = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
    introspection: !isProd,
    csrfPrevention: true,
    cache: "bounded",
    formatError: (err): GraphQLFormattedError => {
      const original = err.originalError as any;

      const code = original?.code || err.extensions?.code || "INTERNAL_ERROR";

      const statusCode =
        original?.statusCode || err.extensions?.statusCode || 500;

      logger.error({
        message: err.message,
        code,
        statusCode,
        path: err.path || [],
      });

      // Production response
      if (isProd) {
        return {
          message: "Internal Server Error",
          locations: err.locations ?? [],
          path: err.path ?? [],
          extensions: { code, statusCode },
        };
      }

      // Development response
      return {
        message: err.message,
        locations: err.locations ?? [],
        path: err.path ?? [],
        extensions: { code, statusCode },
      };
    },
  });

  await _Apollo.start();
  _Apollo.applyMiddleware({ app: _App, path: "/graphql" });

  /*
   * 404 HANDLER
   */
  _App.use((_req, _res, next) => {
    next(new AppError("Route not found", 404, "NOT_FOUND"));
  });

  /*
   * GLOBAL ERROR HANDLER
   */
  _App.use(errorHandler);

  logger.info(
    `Server initialized in ${isProd ? "production" : "development"} mode`
  );
  return _App;
};

/*
 * EXPORT
 */
export default CreateApp;
