import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0 },

    stage: {
      type: String,
      enum: ["NEW", "QUALIFIED", "PROPOSAL", "WON", "LOST"],
      default: "NEW",
    },

    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Fast pipeline & list queries
dealSchema.index({ stage: 1 });
dealSchema.index({ owner: 1, createdAt: -1 });

// Pipeline aggregation optimisation
dealSchema.index({ createdAt: -1 });

// Account-based queries
dealSchema.index({ account: 1 });

dealSchema.index({ stage: 1, owner: 1, createdAt: -1 });


export default mongoose.model("Deal", dealSchema);
