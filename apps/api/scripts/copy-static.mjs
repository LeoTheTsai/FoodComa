import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), ".."); // -> apps/api
const srcSchema = join(root, "src", "schema");
const distSchema = join(root, "dist", "schema");

if (!existsSync(srcSchema)) {
  console.error(`[copy-static] Schema folder not found at: ${srcSchema}`);
  process.exit(0); // don’t fail build; logs the path for debugging
}

mkdirSync(distSchema, { recursive: true });
cpSync(srcSchema, distSchema, { recursive: true });
console.log(`[copy-static] Copied ${srcSchema} -> ${distSchema}`);