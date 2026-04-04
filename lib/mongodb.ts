import mongoose from "mongoose";

// Cache for persistent connection across serverless invocations
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize cache if not present
if (!global.mongooseCache) {
  global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

export const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return cached connection
  if (global.mongooseCache.conn) {
    if (mongoose.connection.readyState === 1) {
      return global.mongooseCache.conn;
    }
  }

  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI is not defined in environment variables. Please add it to your .env.local or Vercel environment variables."
      );
    }

    // If a connection promise is already in progress, wait for it
    if (global.mongooseCache.promise) {
      return await global.mongooseCache.promise;
    }

    // Create new connection promise
    global.mongooseCache.promise = mongoose.connect(mongoURI, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    const conn = await global.mongooseCache.promise;
    global.mongooseCache.conn = conn;

    return conn;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ MongoDB connection error:", errorMessage);

    // Reset promise on error to allow retry
    global.mongooseCache.promise = null;

    throw new Error(`MongoDB Connection Failed: ${errorMessage}`);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (global.mongooseCache.conn) {
      await mongoose.disconnect();
      global.mongooseCache.conn = null;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("MongoDB disconnection error:", errorMessage);
  }
};
