import mongoose from "mongoose";
const s = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
  title: { type: String, required: true }, body: { type: String, required: true },
  category: { type: String, enum: ["general", "maintenance", "event", "emergency"], default: "general" },
  isEmergency: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
s.index({ societyId: 1, createdAt: -1 });
export default mongoose.model("Notice", s);
