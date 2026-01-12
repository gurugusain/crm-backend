import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    gst: { type: String, trim: true, uppercase: true },

    industry: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  { timestamps: true }
);

accountSchema.index({ companyName: 1 });
accountSchema.index({ gst: 1 });

// For hierarchy / parent-child accounts
accountSchema.index({ parentAccount: 1 });


export default mongoose.model("Account", accountSchema);
