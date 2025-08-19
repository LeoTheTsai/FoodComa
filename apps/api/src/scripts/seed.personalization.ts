import "dotenv/config";
import mongoose from "mongoose";
import { UserModel, RecipeModel } from "../models/index.js";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);
  console.log("Mongo connected");

  const email = process.env.EMAIL || "leotsai12120@gmail.com";
  const user = await UserModel.findOne({ email });
  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(1);
  }

  // Pick some recipes to populate demo data
  const all = await RecipeModel.find({}).sort({ createdAt: -1 }).limit(20).lean();
  const lastViewed = all.slice(0, 6).map((r: any) => r._id); // cap to 6
  const favorites = all.slice(6, 12).map((r: any) => r._id);
  const claimMine = String(process.env.CLAIM_MINE || "false").toLowerCase() === "true";
  if (claimMine) {
    const mine = all.slice(0, 3).map((r: any) => r._id);
    if (mine.length) {
      await RecipeModel.updateMany({ _id: { $in: mine } }, { $set: { ownerId: String(user.id) } });
    }
  }

  // Update user personalization fields
  user.favoriteRecipeIds = favorites as any;
  user.lastViewedRecipeIds = lastViewed as any; // recent-first
  await user.save();

  console.log(`Updated user ${user.email}: favorites=${favorites.length}, lastViewed=${lastViewed.length} (capped 6)`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
