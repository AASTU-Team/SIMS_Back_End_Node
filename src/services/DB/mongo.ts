import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export = async function mongo(): Promise<void> {
  mongoose.connection.on("connected", () => console.log("connected"));
  mongoose.connection.on("error", (err: Error) => {
    console.log(`MongoDB connection error: ${err}`);
  });
  await mongoose.connect(process.env.MONGODB_URI || "", {});
};
