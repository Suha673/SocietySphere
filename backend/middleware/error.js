export const notFound = (req, res) => res.status(404).json({ success: false, message: "Route not found" });
export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500, message = err.message;
  if (err.code === 11000) { status = 409; message = "Duplicate record"; }
  if (err.name === "CastError") { status = 404; message = "Not found"; }
  if (status === 500) { console.error(err); message = "Server error"; }
  res.status(status).json({ success: false, message });
};
