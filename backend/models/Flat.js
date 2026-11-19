import mongoose from "mongoose";
const ref = (r, req) => ({ type: mongoose.Schema.Types.ObjectId, ref: r, required: req });
const s = new mongoose.Schema({
  societyId: ref("Society", true), buildingId: ref("Building", true),
  flatNumber: { type: String, required: true, trim: true }, floor: Number,
  occupancyStatus: { type: String, enum: ["occupied", "vacant"], default: "vacant" },
  residentType: { type: String, enum: ["owner", "tenant"] },
}, { timestamps: true });
s.index({ societyId: 1, buildingId: 1, flatNumber: 1 }, { unique: true });
export default mongoose.model("Flat", s);
