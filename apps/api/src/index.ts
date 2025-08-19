import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { schema } from "./resolvers/index.js";
import { authFromReq } from "./lib/auth.js";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await mongoose.connect(config.mongoUri);
  logger.info("Mongo connected");

  const apollo = new ApolloServer({ schema });
  await apollo.start();

  const app = express();
  app.use(cookieParser());
  app.use(cors({ origin: config.webOrigin, credentials: true }));
  app.use(express.json());

  // Serve cached images from /images
  const imagesDir = path.join(process.cwd(), "public", "images");
  app.use("/images", express.static(imagesDir));

  // serve generated images
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use("/graphql", expressMiddleware(apollo, {
    context: async ({ req, res }) => ({ req, res, user: authFromReq(req) })
  }));

  app.listen(config.port, () => logger.info(`API on http://localhost:${config.port}/graphql`));
}
main().catch((e) => { console.error(e); process.exit(1); });
