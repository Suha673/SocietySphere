import { Router } from "express";
import { z } from "zod";
import Notice from "../models/Notice.js";
import { protect, authorize, tenant } from "../middleware/auth.js";
import { ApiError, asyncHandler, parse, listResponse } from "../utils/helpers.js";

const r = Router();
r.use(protect, tenant);
const schema = z.object({ title: z.string().min(2), body: z.string().min(1),
  category: z.enum(["general", "maintenance", "event", "emergency"]).optional(), isEmergency: z.boolean().optional() });

r.post("/", authorize("admin"), asyncHandler(async (req, res) =>
  res.status(201).json({ success: true, data: await Notice.create({ ...parse(schema, req.body), societyId: req.user.societyId, createdBy: req.user._id }) })));
r.get("/", asyncHandler(async (req, res) => {
  const out = await listResponse(Notice, { societyId: req.user.societyId }, req);
  const uid = String(req.user._id);
  out.data = out.data.map(({ readBy, ...n }) => ({ ...n, read: readBy.some((id) => String(id) === uid) }));
  res.json(out);
}));
r.patch("/:id", authorize("admin"), asyncHandler(async (req, res) => {
  const n = await Notice.findOneAndUpdate({ _id: req.params.id, societyId: req.user.societyId }, parse(schema.partial(), req.body), { new: true }).lean();
  if (!n) throw new ApiError(404, "Notice not found");
  res.json({ success: true, data: n });
}));
r.delete("/:id", authorize("admin"), asyncHandler(async (req, res) => {
  if (!(await Notice.findOneAndDelete({ _id: req.params.id, societyId: req.user.societyId }))) throw new ApiError(404, "Notice not found");
  res.json({ success: true, message: "Deleted" });
}));
r.post("/:id/read", asyncHandler(async (req, res) => {
  const n = await Notice.updateOne({ _id: req.params.id, societyId: req.user.societyId }, { $addToSet: { readBy: req.user._id } });
  if (!n.matchedCount) throw new ApiError(404, "Notice not found");
  res.json({ success: true });
}));
export default r;
