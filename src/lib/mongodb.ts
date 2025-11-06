import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("Connecting to MongoDB Atlas...");

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000, // 30 seconds
        connectTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 30000, // 30 seconds
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Atlas connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB Atlas connection failed:", error.message);
        cached.promise = null; // Reset promise so it can retry
        throw new Error(`MongoDB connection failed: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset for retry
    throw error;
  }
}
