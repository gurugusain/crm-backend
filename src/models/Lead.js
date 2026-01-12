import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true, required: true },

    company: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED"],
      default: "NEW",
    },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    isDeleted: { type: Boolean, default: false }, // soft delete
  },
  { timestamps: true }
);

// Ownership + listing
leadSchema.index({ owner: 1, createdAt: -1 });

// Search optimisation
leadSchema.index({ company: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });


export default mongoose.model("Lead", leadSchema);
