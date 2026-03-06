import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // hashed, null for Google OAuth users
    provider: { type: String, default: "credentials" }, // "credentials" | "google"
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", UserSchema);
export default User;
