import mongoose from "mongoose";
const s = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
  name: { type: String, required: true, trim: true },
}, { timestamps: true });
s.index({ societyId: 1, name: 1 }, { unique: true });
export default mongoose.model("Building", s);
