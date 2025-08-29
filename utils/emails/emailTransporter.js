import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: true,
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // email password or app password
  },
});
