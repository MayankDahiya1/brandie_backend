/*
 * IMPORT
 */
import {
  defaultFieldResolver,
  GraphQLFieldConfig,
  GraphQLSchema,
} from "graphql";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import _Redis from "../../config/redis";
import AppError from "../errors/AppError";
import logger from "../utils/logger";

/*
 * FUNCTION
 */
export const rateLimitDirectiveTransformer = (
  schema: GraphQLSchema,
  directiveName = "rateLimit"
) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any>) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (!directive) return fieldConfig;

      const { limit = 10, window = 60 } = directive; // default: 10 requests/minute
      const originalResolve = fieldConfig.resolve || defaultFieldResolver;

      fieldConfig.resolve = async (source, args, context, info) => {
        try {
          const user = context.req?.user;
          const key = user
            ? `rate:${directiveName}:${user.id}:${info.fieldName}`
            : `rate:${directiveName}:${context.req.ip}:${info.fieldName}`;

          const current = await _Redis.incr(key);

          if (current === 1) {
            await _Redis.expire(key, window);
          }

          if (current > limit) {
            logger.warn({
              message: "Rate limit exceeded",
              key,
              userId: user?.id,
              ip: context.req.ip,
              field: info.fieldName,
            });
            throw new AppError("Too many requests", 429, "RATE_LIMITED");
          }

          return originalResolve(source, args, context, info);
        } catch (error: any) {
          if (error instanceof AppError) throw error;
          logger.error({ message: "Rate limit directive failure", error });
          throw new AppError(
            "Internal rate limiter error",
            500,
            "RATE_LIMIT_ERROR"
          );
        }
      };

      return fieldConfig;
    },
  });
};
