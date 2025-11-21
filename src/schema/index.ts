/*
 * IMPORT
 */
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { gql } from "apollo-server-express";

/* MODULE SCHEMAS */
import { userAuthResolvers, userTypeDefs } from "../modules/auth";
import { followAuthResolvers, followTypeDefs } from "../modules/follow";
import { postAuthResolvers, postTypeDefs } from "../modules/post";
import { likeAuthResolvers, likeTypeDefs } from "../modules/like";
import { commentAuthResolvers, commentTypeDefs } from "../modules/comments";
import { feedAuthResolvers, feedTypeDefs } from "../modules/feed";

/* DIRECTIVES */
import { authDirectiveTransformer } from "../core/directives/auth.directive";
import { rateLimitDirectiveTransformer } from "../core/directives/rateLimit.directive";

/*
 * ROOT TYPEDEFS
 */
const RootTypeDef = gql`
  directive @auth on FIELD_DEFINITION
  directive @rateLimit(limit: Int, duration: Int) on FIELD_DEFINITION
  type Query {
    _root: String
  }

  type Mutation {
    _root: String
  }
`;

/*
 * MERGE TYPEDEFS
 */
const typeDefs = mergeTypeDefs([
  RootTypeDef,
  userTypeDefs,
  followTypeDefs,
  postTypeDefs,
  likeTypeDefs,
  commentTypeDefs,
  feedTypeDefs,
]);

/*
 * MERGE RESOLVERS
 */
const resolvers = mergeResolvers([
  userAuthResolvers,
  followAuthResolvers,
  postAuthResolvers,
  likeAuthResolvers,
  commentAuthResolvers,
  feedAuthResolvers,
]) as any;

/*
 * BUILD SCHEMA
 */
let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

/*
 * APPLY DIRECTIVES
 */
schema = authDirectiveTransformer(schema, "auth");
schema = rateLimitDirectiveTransformer(schema, "rateLimit");

/*
 * EXPORT
 */
export default schema;
