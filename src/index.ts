import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { env } from "./config/env.js";
import cors from "cors";
import express from "express";
import errorHandler from "./middleware/error.handler.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import "./config/passport.js";
import passport from "passport";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(passport.initialize());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
