import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // MONGO_URI asosiy nom; eski loyihalardagi MONGO_URl ham qo'llab-quvvatlanadi
    const uri = process.env.MONGO_URI || process.env.MONGO_URl;

    if (!uri) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
