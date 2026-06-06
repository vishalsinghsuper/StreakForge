import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod = null;

/**
 * Connect to MongoDB with in-memory fallback.
 * Uses MONGO_URI from environment, falling back to local default.
 * If local connection fails, starts an in-memory MongoDB fallback server.
 */
export default async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/streakforge";
  const isLocal = uri.includes("localhost") || uri.includes("127.0.0.1");

  try {
    // Hide credentials in logs if it's an Atlas URI (e.g. mongodb+srv://...)
    const safeUriForLogs = uri.includes("@") 
      ? uri.replace(/\/\/.*@/, "//****:****@") 
      : uri;

    console.log(`🔌 Attempting connection to MongoDB at: ${safeUriForLogs}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    if (isLocal) {
      console.warn(`⚠️ Local MongoDB connection failed: ${err.message}`);
      console.log("🚀 Starting in-memory MongoDB fallback server (v5.0.26)...");
      try {
        mongod = await MongoMemoryServer.create({
          binary: {
            version: "5.0.26", // Smaller binary than v8.x, much faster to download
          },
        });
        const mongoUri = mongod.getUri();
        console.log(`ℹ️ In-memory MongoDB URI: ${mongoUri}`);

        await mongoose.connect(mongoUri);
        console.log(`✅ Connected to In-Memory MongoDB: ${mongoose.connection.host}`);
      } catch (memErr) {
        console.error(`❌ Failed to start In-Memory MongoDB: ${memErr.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ MongoDB connection to external host/Atlas failed: ${err.message}`);
      console.error("💡 Please verify your connection string, credentials, and MongoDB Atlas network whitelist IP rules.");
      process.exit(1);
    }
  }

  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting reconnect...");
  });
}
