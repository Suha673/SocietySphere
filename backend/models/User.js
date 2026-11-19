import mongoose from "mongoose";
const s = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: String,
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: String,
  role: { type: String, enum: ["super_admin", "admin", "resident", "guard", "staff", "accountant"], required: true },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", default: null, index: true },
  flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", default: null },
  status: { type: String, enum: ["active", "pending", "blocked"], default: "pending" },
}, { timestamps: true });
s.index({ email: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
export default mongoose.model("User", s);
