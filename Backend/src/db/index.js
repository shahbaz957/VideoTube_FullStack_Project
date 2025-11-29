import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB Connected at : DB HOST -> ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`DataBase Connection ${error}`);
    process.exit(1);
  }
};

export default connectDB;
