import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import Society from "../models/Society.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { ApiError, asyncHandler, parse, signToken, setAuthCookie } from "../utils/helpers.js";

const r = Router();
const registerSchema = z.object({
  societyName: z.string().min(2), city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional(),
  firstName: z.string().min(1), lastName: z.string().optional(),
  email: z.string().email(), password: z.string().min(8), phone: z.string().optional(),
});

r.post("/register-society", asyncHandler(async (req, res) => {
  const d = parse(registerSchema, req.body);
  if (await User.findOne({ email: d.email }).collation({ locale: "en", strength: 2 })) throw new ApiError(409, "Email already registered");
  const society = await Society.create({ name: d.societyName, contactEmail: d.email, address: { city: d.city, state: d.state, pincode: d.pincode } });
  try {
    const user = await User.create({
      firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone,
      password: await bcrypt.hash(d.password, 12), role: "admin", societyId: society._id, status: "active",
    });
    setAuthCookie(res, signToken(user._id));
    res.status(201).json({ success: true, message: "Society registered", data: { id: user._id, role: user.role, societyId: society._id } });
  } catch (e) { await Society.deleteOne({ _id: society._id }); throw e; }
}));

r.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = parse(z.object({ email: z.string().email(), password: z.string().min(1) }), req.body);
  const user = await User.findOne({ email }).collation({ locale: "en", strength: 2 }).select("+password");
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new ApiError(401, "Invalid email or password");
  if (user.status !== "active") throw new ApiError(403, "Account is not active");
  setAuthCookie(res, signToken(user._id));
  res.json({ success: true, data: { id: user._id, firstName: user.firstName, role: user.role, societyId: user.societyId } });
}));

r.post("/logout", (req, res) => { res.clearCookie("token"); res.json({ success: true, message: "Logged out" }); });
r.get("/me", protect, (req, res) => { const { password, ...u } = req.user; res.json({ success: true, data: u }); });

export default r;
