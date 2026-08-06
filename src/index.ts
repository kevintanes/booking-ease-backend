import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import errorHandler from "./middleware/error.handler.js";
import authRoutes from "./routes/auth.routes.js";
import serviceRoutes from "./routes/service.routes.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/service", serviceRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
