import mongoose from "mongoose";
import { config } from "dotenv";
config();
const connectMongo = async () => {
  try {
    // pharmadb_mongo es el nombre del servicio en docker,
    // pero si corres node en local usa 'localhost'
    await mongoose.connect(process.env.MONGO_DATABASE_URL);
    console.log("🌿 MongoDB Conectado para Documentos");
  } catch (error) {
    console.error("Error conectando a Mongo:", error);
  }
};

export default connectMongo;
