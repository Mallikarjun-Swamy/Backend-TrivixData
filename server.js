// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import { connectSupabase } from "./db/supabase.js";
import profileRoutes from "./routes/profileRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import downloadsRoutes from "./routes/downloadsRoutes.js";
import { initGDrive } from "./utils/gdriveClient.js";
import sampleRoutes from "./routes/sampleRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsLetterController from "./controllers/newsLetterController.js";

// Load environment variables immediately
dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://www.trivixdatasolutions.com",
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// // 👇 Add this for preflight
// app.options(
//   "*",
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize external clients
// NOTE: Make sure these functions are non-blocking and fast
// The `connectSupabase()` call is placed inside the `app.set` to avoid a separate const.
initGDrive();
app.set("supabase", connectSupabase());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

app.use(apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/user/download", downloadsRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/trivix-admin/files", fileRoutes);
app.use("/api/trivix-admin", adminRoutes);
app.use("/api/contact/", contactRoutes);
app.use("/api/subscribe", newsLetterController);

export default app;
