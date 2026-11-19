import jwt from "jsonwebtoken";
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
export const setAuthCookie = (res, token) =>
  res.cookie("token", token, {
    httpOnly: true, sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production", maxAge: 864e5,
  });
export const parse = (schema, data) => {
  const r = schema.safeParse(data);
  if (!r.success) throw new ApiError(400, r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return r.data;
};
export const paginate = (q) => {
  const page = Math.max(1, +q.page || 1), limit = Math.min(50, Math.max(1, +q.limit || 10));
  return { page, limit, skip: (page - 1) * limit };
};
export const listResponse = async (Model, filter, req, opts = {}) => {
  const { page, limit, skip } = paginate(req.query);
  const [data, total] = await Promise.all([
    Model.find(filter).sort(opts.sort || { createdAt: -1 }).skip(skip).limit(limit).lean(),
    Model.countDocuments(filter),
  ]);
  return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
