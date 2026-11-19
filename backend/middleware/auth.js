import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError, asyncHandler } from "../utils/helpers.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = req.cookies?.token || (header?.startsWith("Bearer ") ? header.slice(7) : null);
  if (!token) throw new ApiError(401, "Not authenticated");
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new ApiError(401, "Invalid or expired token"); }
  const user = await User.findById(payload.id).lean();
  if (!user || user.status !== "active") throw new ApiError(401, "Account inactive");
  req.user = user;
  next();
});
// Role check enforced on the server; hiding buttons in React is never enough.
export const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new ApiError(403, "Forbidden"));
// Society id ALWAYS comes from the authenticated user, never from the request.
export const tenant = (req, res, next) =>
  req.user.societyId ? next() : next(new ApiError(403, "No society linked to account"));
