import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB is Connected Successfully!");
  } catch (error) {
    console.log("MongoDB Connected Failed!", error);
    process.exit(1);
  }
};

export default connectDB;
