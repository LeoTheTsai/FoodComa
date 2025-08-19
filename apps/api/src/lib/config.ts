import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI!,
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:5173"
};