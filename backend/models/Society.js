import mongoose from "mongoose";
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  registrationNumber: String,
  address: { city: String, state: String, pincode: String },
  contactEmail: String, contactPhone: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });
export default mongoose.model("Society", s);
