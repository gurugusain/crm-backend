import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, select: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "SALES", "MANAGER"],
      default: "SALES",
    },

    refreshTokens: { type: [refreshTokenSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
