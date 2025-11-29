import mongoose from "mongoose";
import { config } from "dotenv";
config();
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DATABASE_URL);
    console.log("🌿 MongoDB Conectado para Documentos");
  } catch (error) {
    console.error("Error conectando a Mongo:", error);
  }
};

export default connectMongo;
