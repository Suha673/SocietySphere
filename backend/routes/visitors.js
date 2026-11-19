import { Router } from "express";
import { z } from "zod";
import Visitor from "../models/Visitor.js";
import Flat from "../models/Flat.js";
import User from "../models/User.js";
import { protect, authorize, tenant } from "../middleware/auth.js";
import { ApiError, asyncHandler, parse, listResponse } from "../utils/helpers.js";

const r = Router();
r.use(protect, tenant);
const scope = (req) => ({ _id: req.params.id, societyId: req.user.societyId });
const load = async (req) => { const v = await Visitor.findOne(scope(req)); if (!v) throw new ApiError(404, "Visitor not found"); return v; };
const move = async (v, status, by, extra = {}) => { v.status = status; Object.assign(v, extra); v.history.push({ status, by }); await v.save(); return v; };

r.post("/", authorize("admin", "resident", "guard"), asyncHandler(async (req, res) => {
  const d = parse(z.object({ visitorName: z.string().min(1), phone: z.string().optional(), purpose: z.string().optional(),
    vehicleNumber: z.string().optional(), flatId: z.string().optional() }), req.body);
  const isResident = req.user.role === "resident";
  const flatId = isResident ? req.user.flatId : d.flatId;
  if (!flatId || !(await Flat.exists({ _id: flatId, societyId: req.user.societyId }))) throw new ApiError(400, "Valid flat required");
  const resident = await User.findOne({ societyId: req.user.societyId, flatId, role: "resident", status: "active" }).select("_id").lean();
  // Resident-created (expected) visitors are pre-approved; guard walk-ins wait for the resident.
  const status = isResident ? "approved" : "pending";
  const v = await Visitor.create({ ...d, flatId, societyId: req.user.societyId, residentId: resident?._id, createdBy: req.user._id,
    status, history: [{ status, by: req.user._id }] });
  res.status(201).json({ success: true, data: v });
}));

r.get("/", asyncHandler(async (req, res) => {
  const f = { societyId: req.user.societyId };
  if (req.user.role === "resident") f.flatId = req.user.flatId;
  else if (!["admin", "guard"].includes(req.user.role)) throw new ApiError(403, "Forbidden");
  if (req.query.status) f.status = req.query.status;
  res.json(await listResponse(Visitor, f, req));
}));

const decide = (status) => asyncHandler(async (req, res) => {
  const v = await load(req);
  const own = req.user.role === "resident" && String(v.flatId) === String(req.user.flatId);
  if (!own && req.user.role !== "admin") throw new ApiError(403, "You can only decide visitors for your own flat");
  if (v.status !== "pending") throw new ApiError(409, `Visitor is already ${v.status}`);
  res.json({ success: true, data: await move(v, status, req.user._id) });
});
r.patch("/:id/approve", decide("approved"));
r.patch("/:id/reject", decide("rejected"));

r.patch("/:id/check-in", authorize("guard", "admin"), asyncHandler(async (req, res) => {
  const v = await load(req);
  if (v.status !== "approved") throw new ApiError(409, "Only approved visitors can check in");
  res.json({ success: true, data: await move(v, "checked_in", req.user._id, { entryTime: new Date() }) });
}));
r.patch("/:id/check-out", authorize("guard", "admin"), asyncHandler(async (req, res) => {
  const v = await load(req);
  if (v.status !== "checked_in") throw new ApiError(409, "Visitor is not checked in");
  res.json({ success: true, data: await move(v, "checked_out", req.user._id, { exitTime: new Date() }) });
}));
export default r;
