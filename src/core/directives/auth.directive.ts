/*
 * IMPORT
 */
import {
  defaultFieldResolver,
  GraphQLFieldConfig,
  GraphQLSchema,
} from "graphql";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import AppError from "../errors/AppError";

/*
 * HELPER
 */
const checkAuth = (context: any) => {
  const user = context.req?.user;
  if (!user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return user;
};

/*
 * DIRECTIVES EXPORT
 */
export const authDirectiveTransformer = (
  schema: GraphQLSchema,
  directiveName = "auth"
) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any>) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];
      if (authDirective) {
        const originalResolve = fieldConfig.resolve || defaultFieldResolver;
        fieldConfig.resolve = async (source, args, context, info) => {
          checkAuth(context);
          return originalResolve(source, args, context, info);
        };
        return fieldConfig;
      }
    },
  });

export const roleDirectiveTransformer = (
  schema: GraphQLSchema,
  directiveName = "role"
) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any>) => {
      const roleDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];
      if (roleDirective) {
        const { requires } = roleDirective;
        const originalResolve = fieldConfig.resolve || defaultFieldResolver;

        fieldConfig.resolve = async (source, args, context, info) => {
          const user = checkAuth(context);

          if (!user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

          if (user.role !== requires) {
            throw new AppError(
              `Access restricted: your role "${user.role}" does not have permission to perform this action. Required role: "${requires}".`,
              403,
              "FORBIDDEN"
            );
          }

          return originalResolve(source, args, context, info);
        };

        return fieldConfig;
      }
    },
  });
