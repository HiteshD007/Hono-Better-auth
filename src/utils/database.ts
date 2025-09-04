import mongoose  from "mongoose";
import logger from "./winston";


const ConnectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info("Connected To MongoDB");
  } catch (error) {
    logger.error("Cannot Connect to MongoDB",error);
  }
}

export default ConnectToDB;