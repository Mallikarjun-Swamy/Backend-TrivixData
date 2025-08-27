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

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Prevent browser caching for all responses
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Initialize Google Drive client (instead of Backblaze B2)
initGDrive();

// ✅ Connect to Supabase
const supabase = connectSupabase();
app.set("supabase", supabase);

// === Add the Rate Limiter here ===
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

// Apply the rate limiter to all requests
app.use(apiLimiter);

// Routes

// Authnticated UserRoutes
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/user/download", downloadsRoutes);
app.use("/api/samples", sampleRoutes);

//admin Routes
app.use("/api/trivix-admin/files", fileRoutes);
app.use("/api/trivix-admin", adminRoutes);

//General User Routes
app.use("/api/contact/", contactRoutes);
app.use("/api/subscribe", newsLetterController);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// // Export Express app as Firebase function
// export const api = https.onRequest(app);
