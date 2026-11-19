import mongoose from "mongoose";
const ref = (r, req) => ({ type: mongoose.Schema.Types.ObjectId, ref: r, required: req });
const s = new mongoose.Schema({
  societyId: ref("Society", true), residentId: ref("User", true),
  title: { type: String, required: true }, description: String,
  category: { type: String, enum: ["electricity", "plumbing", "cleaning", "security", "other"], default: "other" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["pending", "assigned", "in_progress", "resolved", "closed"], default: "pending" },
  assignedTo: ref("User"), images: [String], resolvedAt: Date,
  comments: [{ by: ref("User"), text: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
s.index({ societyId: 1, status: 1, createdAt: -1 });
s.index({ societyId: 1, assignedTo: 1 });
export default mongoose.model("Complaint", s);
