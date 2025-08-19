import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: String,
    passwordHash: { type: String, required: true },
    // personalization
    favoriteRecipeIds: [{ type: Schema.Types.ObjectId, ref: "Recipe", index: true }],
    lastViewedRecipeIds: [{ type: Schema.Types.ObjectId, ref: "Recipe" }], // keep recent-first, max 6
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
UserSchema.virtual("id").get(function () { return this._id.toString(); });
export const UserModel = mongoose.model("User", UserSchema);
