import express from "express";
import type { Request, Response } from "express";
import errorHandler from "./middleware/error.handler.js";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
