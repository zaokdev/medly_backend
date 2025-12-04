import dotenv from "dotenv";
import express from "express";
import { sessionConfig as sessionMiddleware } from "./middleware/sessionMiddleware.js";
import connectMongo from "./db/mongo.js";
import pkg from "colors";
import { errorHandler } from "./middleware/errorHandlerMiddleware.js";
import authRouter from "./routes/auth.routes.js";
import searchRouter from "./routes/search.routes.js";
import doctorsRouter from "./routes/doctors.routes.js";
import appointmentsRouter from "./routes/appointments.routes.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
connectMongo();

app.use(express.json());
app.use(sessionMiddleware);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/search", searchRouter);
app.use("/doctors", doctorsRouter);
app.use("/appointments", appointmentsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`---MEDLY BACKEND---`.green);
  console.log(`Escuchando en el puerto ${PORT}`.blue);
});
