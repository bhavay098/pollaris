// Establishes the Mongoose connection to MongoDB. Called once from the
// server bootstrap before the app starts listening.

import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
};

export default connectDB;
