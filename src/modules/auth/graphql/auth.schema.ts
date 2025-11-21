/*
 * IMPORT
 */
import { readFileSync } from "fs";
import path from "path";
import { gql } from "apollo-server-express";

// Schema path
const _SchemaPath = path.join(__dirname, "auth.schema.graphql");

const _TypeDefs = gql(readFileSync(_SchemaPath, { encoding: "utf-8" }));

/*
 * EXPORT
 */
export default _TypeDefs;
