import mongoose from "mongoose";

const dealTaskSchema = new mongoose.Schema(
  {
    deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },

    title: { type: String, required: true, trim: true },

    dueDate: { type: Date },

    status: { type: String, enum: ["OPEN", "DONE"], default: "OPEN" },

    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },

    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("DealTask", dealTaskSchema);
