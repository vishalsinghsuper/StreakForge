import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    pillar: {
      type: String,
      enum: ["Iron", "Mind", "General"],
      default: "General",
    },
    done: {
      type: Boolean,
      default: false,
    },
    createdAfterEditCutoff: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
