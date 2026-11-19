import mongoose from "mongoose";
const ref = (r, req) => ({ type: mongoose.Schema.Types.ObjectId, ref: r, required: req });
const s = new mongoose.Schema({
  societyId: ref("Society", true), flatId: ref("Flat", true),
  residentId: ref("User"), createdBy: ref("User"),
  visitorName: { type: String, required: true }, phone: String, purpose: String, vehicleNumber: String,
  status: { type: String, enum: ["pending", "approved", "rejected", "checked_in", "checked_out"], default: "pending" },
  entryTime: Date, exitTime: Date,
  history: [{ status: String, by: ref("User"), at: { type: Date, default: Date.now }, _id: false }],
}, { timestamps: true });
s.index({ societyId: 1, status: 1, createdAt: -1 });
s.index({ societyId: 1, flatId: 1 });
export default mongoose.model("Visitor", s);
