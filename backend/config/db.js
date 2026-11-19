import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    console.log("Checking MongoDB configuration...");
    console.log("MONGO_URI exists:", Boolean(mongoURI));

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing. Check backend/.env");
    }

    await mongoose.connect(mongoURI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 8000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};