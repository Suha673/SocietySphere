import { Router } from "express";
import { z } from "zod";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { protect, authorize, tenant } from "../middleware/auth.js";
import { ApiError, asyncHandler, parse, listResponse } from "../utils/helpers.js";

const r = Router();
r.use(protect, tenant);
// Visibility: admin = all, resident = own, staff = assigned. Others = none.
const visible = (req) => {
  const f = { societyId: req.user.societyId }, { role, _id } = req.user;
  if (role === "resident") f.residentId = _id;
  else if (role === "staff") f.assignedTo = _id;
  else if (role !== "admin") throw new ApiError(403, "Forbidden");
  return f;
};
const load = async (req) => { const c = await Complaint.findOne({ _id: req.params.id, ...visible(req) }); if (!c) throw new ApiError(404, "Complaint not found"); return c; };

r.post("/", authorize("resident", "admin"), asyncHandler(async (req, res) => {
  const d = parse(z.object({ title: z.string().min(3), description: z.string().optional(),
    category: z.enum(["electricity", "plumbing", "cleaning", "security", "other"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(), images: z.array(z.string().url()).max(5).optional() }), req.body);
  res.status(201).json({ success: true, data: await Complaint.create({ ...d, societyId: req.user.societyId, residentId: req.user._id }) });
}));
r.get("/", asyncHandler(async (req, res) => {
  const f = visible(req);
  for (const k of ["status", "category", "priority"]) if (req.query[k]) f[k] = req.query[k];
  res.json(await listResponse(Complaint, f, req));
}));
r.get("/:id", asyncHandler(async (req, res) => res.json({ success: true, data: await load(req) })));

r.patch("/:id/assign", authorize("admin"), asyncHandler(async (req, res) => {
  const { staffId } = parse(z.object({ staffId: z.string() }), req.body);
  if (!(await User.exists({ _id: staffId, societyId: req.user.societyId, role: "staff", status: "active" }))) throw new ApiError(404, "Staff not found");
  const c = await load(req);
  Object.assign(c, { assignedTo: staffId, status: "assigned" }); await c.save();
  res.json({ success: true, data: c });
}));

// Allowed status transitions per role.
const flow = {
  staff: { assigned: ["in_progress"], in_progress: ["resolved"] },
  resident: { resolved: ["closed", "pending"] }, // confirm or reopen
  admin: { pending: ["assigned"], assigned: ["in_progress"], in_progress: ["resolved"], resolved: ["closed", "pending"] },
};
r.patch("/:id/status", authorize("admin", "staff", "resident"), asyncHandler(async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(["pending", "in_progress", "resolved", "closed"]) }), req.body);
  const c = await load(req);
  if (!flow[req.user.role]?.[c.status]?.includes(status)) throw new ApiError(409, `Cannot move from ${c.status} to ${status}`);
  c.status = status;
  if (status === "resolved") c.resolvedAt = new Date();
  await c.save();
  res.json({ success: true, data: c });
}));
r.post("/:id/comments", asyncHandler(async (req, res) => {
  const { text } = parse(z.object({ text: z.string().min(1).max(1000) }), req.body);
  const c = await load(req);
  c.comments.push({ by: req.user._id, text }); await c.save();
  res.status(201).json({ success: true, data: c.comments });
}));
export default r;
