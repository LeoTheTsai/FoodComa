import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(here, "..");
const srcSchema = join(apiRoot, "src", "schema");
const distSchema = join(apiRoot, "dist", "schema");

if (existsSync(srcSchema)) {
  mkdirSync(distSchema, { recursive: true });
  cpSync(srcSchema, distSchema, { recursive: true });
  console.log("Copied GraphQL schema to dist/schema");
} else {
  console.warn("No src/schema directory to copy.");
}