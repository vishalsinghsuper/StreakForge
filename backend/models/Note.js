import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
