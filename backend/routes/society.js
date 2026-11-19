import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import Society from "../models/Society.js";
import Building from "../models/Building.js";
import Flat from "../models/Flat.js";
import User from "../models/User.js";
import Visitor from "../models/Visitor.js";
import Complaint from "../models/Complaint.js";
import { protect, authorize, tenant } from "../middleware/auth.js";
import { ApiError, asyncHandler, parse, listResponse } from "../utils/helpers.js";

const r = Router();
r.use(protect, tenant);

r.get("/societies/me", asyncHandler(async (req, res) =>
  res.json({ success: true, data: await Society.findById(req.user.societyId).lean() })));
r.patch("/societies/me", authorize("admin"), asyncHandler(async (req, res) => {
  const d = parse(z.object({ name: z.string().min(2), contactPhone: z.string(), contactEmail: z.string().email() }).partial(), req.body);
  res.json({ success: true, data: await Society.findByIdAndUpdate(req.user.societyId, d, { new: true }).lean() });
}));

r.post("/buildings", authorize("admin"), asyncHandler(async (req, res) => {
  const { name } = parse(z.object({ name: z.string().min(1) }), req.body);
  res.status(201).json({ success: true, data: await Building.create({ societyId: req.user.societyId, name }) });
}));
r.get("/buildings", asyncHandler(async (req, res) => res.json(await listResponse(Building, { societyId: req.user.societyId }, req))));

r.post("/flats", authorize("admin"), asyncHandler(async (req, res) => {
  const d = parse(z.object({ buildingId: z.string(), flatNumber: z.string().min(1), floor: z.number().optional() }), req.body);
  // Building must belong to the admin's own society.
  if (!(await Building.exists({ _id: d.buildingId, societyId: req.user.societyId }))) throw new ApiError(404, "Building not found");
  res.status(201).json({ success: true, data: await Flat.create({ ...d, societyId: req.user.societyId }) });
}));
r.get("/flats", asyncHandler(async (req, res) => {
  const f = { societyId: req.user.societyId };
  if (req.query.buildingId) f.buildingId = req.query.buildingId;
  res.json(await listResponse(Flat, f, req, { sort: { flatNumber: 1 } }));
}));

r.post("/users/invite", authorize("admin"), asyncHandler(async (req, res) => {
  const d = parse(z.object({
    firstName: z.string().min(1), lastName: z.string().optional(), email: z.string().email(), phone: z.string().optional(),
    role: z.enum(["resident", "guard", "staff", "accountant"]), flatId: z.string().optional(),
  }), req.body);
  if (d.role === "resident") {
    if (!d.flatId || !(await Flat.exists({ _id: d.flatId, societyId: req.user.societyId }))) throw new ApiError(400, "Valid flatId required for residents");
  } else delete d.flatId;
  const tempPassword = crypto.randomBytes(6).toString("base64url");
  const u = await User.create({ ...d, societyId: req.user.societyId, password: await bcrypt.hash(tempPassword, 12), status: "active" });
  if (d.flatId) await Flat.updateOne({ _id: d.flatId }, { occupancyStatus: "occupied" });
  // TODO: email the temp password instead of returning it.
  res.status(201).json({ success: true, data: { id: u._id, email: u.email, tempPassword } });
}));
r.get("/users", authorize("admin"), asyncHandler(async (req, res) => {
  const f = { societyId: req.user.societyId };
  if (req.query.role) f.role = req.query.role;
  res.json(await listResponse(User, f, req));
}));
r.patch("/users/:id/status", authorize("admin"), asyncHandler(async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(["active", "blocked"]) }), req.body);
  const u = await User.findOneAndUpdate({ _id: req.params.id, societyId: req.user.societyId, role: { $ne: "admin" } }, { status }, { new: true }).lean();
  if (!u) throw new ApiError(404, "User not found");
  res.json({ success: true, data: { id: u._id, status: u.status } });
}));

r.get("/dashboard/admin", authorize("admin"), asyncHandler(async (req, res) => {
  const societyId = req.user.societyId, start = new Date(); start.setHours(0, 0, 0, 0);
  const [totalFlats, occupiedFlats, residents, todaysVisitors, pendingComplaints] = await Promise.all([
    Flat.countDocuments({ societyId }), Flat.countDocuments({ societyId, occupancyStatus: "occupied" }),
    User.countDocuments({ societyId, role: "resident" }), Visitor.countDocuments({ societyId, createdAt: { $gte: start } }),
    Complaint.countDocuments({ societyId, status: { $in: ["pending", "assigned", "in_progress"] } }),
  ]);
  res.json({ success: true, data: { totalFlats, occupiedFlats, residents, todaysVisitors, pendingComplaints } });
}));
export default r;
