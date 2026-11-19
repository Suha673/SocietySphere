import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

await connectDB();
const server = app.listen(process.env.PORT || 5000, () => console.log("API on :" + (process.env.PORT || 5000)));
const stop = () => server.close(() => process.exit(0));
process.on("SIGTERM", stop); process.on("SIGINT", stop);
