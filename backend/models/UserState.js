import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0 },
    prev: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
  },
  { _id: false }
);

const userStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    activePillar: {
      type: String,
      enum: ["Iron", "Mind", "General"],
      default: "General",
    },
    statsMaster: { type: streakSchema, default: () => ({}) },
    statsIron: { type: streakSchema, default: () => ({}) },
    statsMind: { type: streakSchema, default: () => ({}) },
    statsGeneral: { type: streakSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("UserState", userStateSchema);
