import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
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
    deadline: {
      type: String, // ISO date string or null for timeless events
      default: null,
    },
    done: {
      type: Boolean,
      default: false,
    },
    doneDate: {
      type: String, // ISO date string when completed
      default: null,
    },
    isArchived: {
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

export default mongoose.model("Event", eventSchema);
