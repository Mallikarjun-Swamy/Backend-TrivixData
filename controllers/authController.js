// import bcrypt from "bcrypt";
// import crypto from "crypto";
// import jwt from "jsonwebtoken";
// import { connectSupabase } from "../db/supabase.js";
// import { sendSignUpVerificationEmail } from "../utils/emails/sendSignUpVerificationEmail.js";
// import { sendEmailChangeEmail } from "../utils/emails/sendEmailChangeEmail.js";
// import { sendPasswordChangeEmail } from "../utils/emails/sendPasswordChangeEmail.js";
// import axios from "axios";
// import qs from "qs";

// const JWT_SECRET = process.env.JWT_SECRET;
// const FRONTEND_URL = process.env.FRONTEND_URL;
// const supabase = connectSupabase();

// // ------------------------------
// // USER REGISTRATION
// // ------------------------------
// export const registerUser = async (req, res) => {
//   const { fullName, email, password, confirmPassword } = req.body;

//   if (!fullName || !email || !password || !confirmPassword)
//     return res.status(400).json({ error: "All fields are required" });

//   if (password !== confirmPassword)
//     return res.status(400).json({ error: "Passwords do not match" });

//   if (password.length < 6)
//     return res
//       .status(400)
//       .json({ error: "Password must be at least 6 characters" });

//   try {
//     const { data: existingUser } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (existingUser)
//       return res.status(400).json({ message: "Email already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const { data, error } = await supabase.from("users").insert([
//       {
//         full_name: fullName,
//         email,
//         password: hashedPassword,
//         is_verified: false,
//       },
//     ]);

//     if (error) return res.status(500).json({ message: error.message });

//     // Generate email verification token
//     const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
//     await supabase.from("email_verifications").insert([{ email, token }]);

//     try {
//       await sendSignUpVerificationEmail(
//         email,
//         `${FRONTEND_URL}/verify-email?token=${token}`
//       );
//     } catch (emailErr) {
//       console.error("Email sending failed:", emailErr);
//     }

//     res.json({
//       message:
//         "User registered successfully. Check your email for verification.",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ------------------------------
// // GOOGLE OAUTH
// // ------------------------------
// export const googleAuthRedirect = async (req, res) => {
//   try {
//     const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.VITE_API_BASE_URL}/api/auth/google/callback&response_type=code&scope=openid email profile`;
//     res.redirect(googleUrl);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Google OAuth failed" });
//   }
// };

// //old
// // export const googleAuthCallback = async (req, res) => {
// //   try {
// //     const { code } = req.query;
// //     if (!code) return res.status(400).json({ message: "No code provided" });

// //     const tokenRes = await axios.post(
// //       "https://oauth2.googleapis.com/token",
// //       qs.stringify({
// //         code,
// //         client_id: process.env.GOOGLE_CLIENT_ID,
// //         client_secret: process.env.GOOGLE_CLIENT_SECRET,
// //         redirect_uri: `${process.env.VITE_API_BASE_URL}/api/auth/google/callback`,
// //         grant_type: "authorization_code",
// //       }),
// //       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
// //     );

// //     const { id_token } = tokenRes.data;
// //     const decoded = jwt.decode(id_token);
// //     const { email, name } = decoded;

// //     // Check if user exists
// //     let { data: existingUser } = await supabase
// //       .from("users")
// //       .select("*")
// //       .eq("email", email)
// //       .single();

// //     let userId;
// //     if (!existingUser) {
// //       const { data: newUser } = await supabase
// //         .from("users")
// //         .insert([{ full_name: name, email, password: "" }])
// //         .select()
// //         .single();
// //       userId = newUser.id;
// //     } else {
// //       userId = existingUser.id;
// //     }

// //     // ------------------------------
// //     // IMPROVEMENT: Save refresh token in DB (7 days) + Access token 15min
// //     // ------------------------------
// //     const accessToken = jwt.sign(
// //       { id: userId, email, role: existingUser?.role || "user" },
// //       JWT_SECRET,
// //       { expiresIn: "15m" }
// //     );
// //     const refreshToken = crypto.randomBytes(64).toString("hex");

// //     await supabase.from("refresh_tokens").insert([
// //       {
// //         user_id: userId,
// //         token: refreshToken,
// //         expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
// //       },
// //     ]);

// //     res.cookie("access_token", accessToken, {
// //       httpOnly: true,
// //       maxAge: 15 * 60 * 1000,
// //       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
// //       secure: process.env.NODE_ENV === "production",
// //     });

// //     res.cookie("refresh_token", refreshToken, {
// //       httpOnly: true,
// //       maxAge: 7 * 24 * 60 * 60 * 1000,
// //       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
// //       secure: process.env.NODE_ENV === "production",
// //     });

// //     res.redirect(`${FRONTEND_URL}/profile`);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Google OAuth callback failed" });
// //   }
// // };

// //new
// export const googleAuthCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) return res.status(400).json({ message: "No code provided" });

//     const tokenRes = await axios.post(
//       "https://oauth2.googleapis.com/token",
//       qs.stringify({
//         code,
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         redirect_uri: `${process.env.VITE_API_BASE_URL}/api/auth/google/callback`,
//         grant_type: "authorization_code",
//       }),
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     const { id_token } = tokenRes.data;
//     const decoded = jwt.decode(id_token);
//     const { email, name } = decoded;

//     // Check if user exists
//     let { data: existingUser } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     let userId;
//     if (!existingUser) {
//       const { data: newUser } = await supabase
//         .from("users")
//         .insert([{ full_name: name, email, password: "" }])
//         .select()
//         .single();
//       userId = newUser.id;
//     } else {
//       userId = existingUser.id;
//     }

//     // ------------------------------
//     // Delete old refresh tokens for this user
//     // ------------------------------
//     await supabase.from("refresh_tokens").delete().eq("user_id", userId);

//     // ------------------------------
//     // Generate tokens
//     // ------------------------------
//     const accessToken = jwt.sign(
//       { id: userId, email, role: existingUser?.role || "user" },
//       JWT_SECRET,
//       { expiresIn: "15m" }
//     );
//     const refreshToken = crypto.randomBytes(64).toString("hex");

//     await supabase.from("refresh_tokens").insert([
//       {
//         user_id: userId,
//         token: refreshToken,
//         expires_at: new Date(Date.now() + 60 * 60 * 1000),
//       },
//     ]);

//     // ------------------------------
//     // Set cookies
//     // ------------------------------
//     res.cookie("access_token", accessToken, {
//       httpOnly: true,
//       maxAge: 15 * 60 * 1000,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.cookie("refresh_token", refreshToken, {
//       httpOnly: true,
//       maxAge: 60 * 60 * 1000,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.redirect(`${FRONTEND_URL}/profile`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Google OAuth callback failed" });
//   }
// };

// // ------------------------------
// // LOGIN USER
// // ------------------------------
// //old

// // export const loginUser = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const { data: user } = await supabase
// //       .from("users")
// //       .select("*")
// //       .eq("email", email)
// //       .single();

// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch)
// //       return res.status(400).json({ message: "Invalid credentials" });

// //     // ------------------------------
// //     // IMPROVEMENT: Delete old refresh tokens on login
// //     // ------------------------------
// //     await supabase.from("refresh_tokens").delete().eq("user_id", user.id);

// //     const accessToken = jwt.sign(
// //       { id: user.id, email: user.email, role: user.role },
// //       JWT_SECRET,
// //       { expiresIn: "15m" }
// //     );

// //     const refreshToken = crypto.randomBytes(64).toString("hex");

// //     await supabase.from("refresh_tokens").insert([
// //       {
// //         user_id: user.id,
// //         token: refreshToken,
// //         expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
// //       },
// //     ]);

// //     res.cookie("access_token", accessToken, {
// //       httpOnly: true,
// //       maxAge: 15 * 60 * 1000,
// //       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
// //       secure: process.env.NODE_ENV === "production",
// //     });

// //     res.cookie("refresh_token", refreshToken, {
// //       httpOnly: true,
// //       maxAge: 7 * 24 * 60 * 60 * 1000,
// //       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
// //       secure: process.env.NODE_ENV === "production",
// //     });

// //     res.json({ message: "Login successful", user });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Login failed" });
// //   }
// // };

// //new
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const { data: user } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const { data: userStatus } = await supabase
//       .from("users")
//       .select("is_verified")
//       .eq("email", email)
//       .single();

//     if (!userStatus.is_verified)
//       return res.status(404).json({
//         message: "Email Not verified, Please Verify Your Email Before Login",
//       });

//     // ------------------------------
//     // Delete old refresh tokens
//     // ------------------------------
//     await supabase.from("refresh_tokens").delete().eq("user_id", user.id);

//     // ------------------------------
//     // Generate new tokens
//     // ------------------------------
//     const accessToken = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     const refreshToken = crypto.randomBytes(64).toString("hex");

//     await supabase.from("refresh_tokens").insert([
//       {
//         user_id: user.id,
//         token: refreshToken,
//         expires_at: new Date(Date.now() + 60 * 60 * 1000),
//       },
//     ]);

//     // ------------------------------
//     // Set cookies
//     // ------------------------------
//     res.cookie("access_token", accessToken, {
//       httpOnly: true,
//       maxAge: 15 * 60 * 1000,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.cookie("refresh_token", refreshToken, {
//       httpOnly: true,
//       maxAge: 60 * 60 * 1000,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.json({ message: "Login successful", user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Login failed" });
//   }
// };

// // ------------------------------
// // LOGOUT USER
// // ------------------------------
// export const logout = async (req, res) => {
//   const { refresh_token } = req.cookies;

//   if (refresh_token) {
//     await supabase.from("refresh_tokens").delete().eq("token", refresh_token);
//   }

//   res.clearCookie("access_token");
//   res.clearCookie("refresh_token");
//   res.json({ message: "Logged out successfully" });
// };

// // ------------------------------
// // REFRESH ACCESS TOKEN
// // ------------------------------

// // Old one - working
// // export const refreshAccessToken = async (req, res) => {
// //   try {
// //     const { refresh_token } = req.cookies;
// //     if (!refresh_token)
// //       return res.status(401).json({ message: "No refresh token" });

// //     const { data: tokenEntry } = await supabase
// //       .from("refresh_tokens")
// //       .select("*")
// //       .eq("token", refresh_token)
// //       .single();

// //     if (!tokenEntry || new Date(tokenEntry.expires_at) < new Date()) {
// //       if (tokenEntry) {
// //         await supabase
// //           .from("refresh_tokens")
// //           .delete()
// //           .eq("token", refresh_token);
// //       }
// //       return res
// //         .status(401)
// //         .json({ message: "Invalid or expired refresh token" });
// //     }

// //     const { data: user } = await supabase
// //       .from("users")
// //       .select("*")
// //       .eq("id", tokenEntry.user_id)
// //       .single();

// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     const newAccessToken = jwt.sign(
// //       { id: user.id, email: user.email, role: user.role },
// //       JWT_SECRET,
// //       { expiresIn: "15m" }
// //     );

// //     res.cookie("access_token", newAccessToken, {
// //       httpOnly: true,
// //       maxAge: 15 * 60 * 1000,
// //       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
// //       secure: process.env.NODE_ENV === "production",
// //     });

// //     res.json({ message: "Access token refreshed", user });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Failed to refresh token" });
// //   }
// // };

// //new code

// export const refreshAccessToken = async (req, res) => {
//   try {
//     const oldRefreshToken = req.cookies.refresh_token;
//     if (!oldRefreshToken)
//       return res.status(401).json({ message: "No refresh token" });

//     // Find old refresh token in DB
//     const { data: tokenEntry } = await supabase
//       .from("refresh_tokens")
//       .select("*")
//       .eq("token", oldRefreshToken)
//       .single();

//     if (!tokenEntry || new Date(tokenEntry.expires_at) < new Date()) {
//       if (tokenEntry) {
//         await supabase
//           .from("refresh_tokens")
//           .delete()
//           .eq("token", oldRefreshToken);
//       }
//       return res
//         .status(401)
//         .json({ message: "Invalid or expired refresh token" });
//     }

//     // Fetch user
//     const { data: user } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", tokenEntry.user_id)
//       .single();

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 1️⃣ Generate new access token
//     const newAccessToken = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     // 2️⃣ Generate new refresh token
//     const newRefreshToken = crypto.randomBytes(64).toString("hex");

//     // 3️⃣ Insert new refresh token & delete old one
//     await supabase.from("refresh_tokens").insert({
//       user_id: user.id,
//       token: newRefreshToken,
//       expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//     });
//     await supabase.from("refresh_tokens").delete().eq("token", oldRefreshToken);

//     // 4️⃣ Set cookies
//     res.cookie("access_token", newAccessToken, {
//       httpOnly: true,
//       maxAge: 15 * 60 * 1000,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.cookie("refresh_token", newRefreshToken, {
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.json({ message: "Access token refreshed", user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to refresh token" });
//   }
// };

// // ------------------------------
// // For Verifying the Email_after rgistration
// // ------------------------------
// export const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.query;
//     if (!token) return res.status(400).json("Token is missing!");

//     // Verify JWT
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const email = decoded.email;

//     // Update user in Supabase
//     const { data, error } = await supabase
//       .from("users")
//       .update({ is_verified: true })
//       .eq("email", email)
//       .select();

//     if (error) return res.status(500).json("Database error.");

//     if (!data || data.length === 0)
//       return res.status(404).json("User not found.");

//     return res.status(200).json("Email verified successfully!");
//   } catch (err) {
//     console.error(err);
//     if (err.name === "TokenExpiredError")
//       return res.status(400).json("Token expired.");
//     return res.status(400).json("Invalid token.");
//   }
// };

// // ------------------------------
// //verify user
// // ------------------------------
// export const getMe = async (req, res) => {
//   try {
//     const token = req.cookies.access_token; // read JWT from cookie
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     const decoded = jwt.verify(token, JWT_SECRET);
//     const { email } = decoded;

//     const { data: user } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ user });
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

// // ------------------------------
// // Request Password Change (sends verification email)
// // ------------------------------
// export const requestPasswordChange = async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;
//     const userId = req.user.id;

//     // 1️⃣ Fetch current user
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", userId)
//       .single();

//     if (userError || !user)
//       return res.status(404).json({ message: "User not found" });

//     // 2️⃣ Check old password
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Old password is incorrect" });

//     // 3️⃣ Generate token with new password embedded
//     const token = jwt.sign({ userId, newPassword }, JWT_SECRET, {
//       expiresIn: "15m",
//     });

//     await supabase
//       .from("email_verifications")
//       .insert([{ email: user.email, token }]);

//     // 4️⃣ Send verification link
//     await sendPasswordChangeEmail(
//       user.email,
//       `${FRONTEND_URL}/verify-password-change?token=${token}`
//     );

//     return res.json({
//       message:
//         "Verification email sent. Please check your inbox to confirm password change.",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to request password change" });
//   }
// };

// // ------------------------------
// // Request Email Change (sends verification email to OLD email)
// // ------------------------------
// export const requestEmailChange = async (req, res) => {
//   try {
//     const { newEmail } = req.body;
//     const userId = req.user.id;

//     // 1️⃣ Fetch current user
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", userId)
//       .single();

//     if (userError || !user)
//       return res.status(404).json({ message: "User not found" });

//     // 2️⃣ Generate token containing new email
//     const token = jwt.sign({ userId, newEmail }, JWT_SECRET, {
//       expiresIn: "15m",
//     });

//     await supabase
//       .from("email_verifications")
//       .insert([{ email: user.email, token }]);

//     // 3️⃣ Send verification link to OLD email first
//     await sendEmailChangeEmail(
//       user.email,
//       `${FRONTEND_URL}/verify-email-change?token=${token}`
//     );

//     return res.json({
//       message:
//         "Verification email sent to your current email. Please confirm before updating.",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to request email change" });
//   }
// };

// // ------------------------------
// // Verify Email Change
// // ------------------------------
// export const verifyEmailChange = async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (!token) return res.status(400).json({ message: "Token missing" });

//     // Verify token
//     const payload = jwt.verify(token, JWT_SECRET);

//     // Fetch user
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", payload.userId)
//       .single();

//     if (userError || !user)
//       return res.status(404).json({ message: "User not found" });

//     // Update email
//     const { error: updateError } = await supabase
//       .from("users")
//       .update({ email: payload.newEmail })
//       .eq("id", payload.userId);

//     if (updateError)
//       return res.status(500).json({ message: "Failed to update email" });

//     res.json({ message: "Email updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// };

// // ------------------------------
// // Verify Password Change
// // ------------------------------
// export const verifyPasswordChange = async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (!token) return res.status(400).json({ message: "Token missing" });

//     // Verify token
//     const payload = jwt.verify(token, JWT_SECRET);

//     // Fetch user
//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", payload.userId)
//       .single();

//     if (userError || !user)
//       return res.status(404).json({ message: "User not found" });

//     // Hash new password from token
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(payload.newPassword, salt);

//     // Update password
//     const { error: updateError } = await supabase
//       .from("users")
//       .update({ password: hashedPassword })
//       .eq("id", payload.userId);

//     if (updateError)
//       return res.status(500).json({ message: "Failed to update password" });

//     res.json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// };

import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectSupabase } from "../db/supabase.js";
import { sendSignUpVerificationEmail } from "../utils/emails/sendSignUpVerificationEmail.js";
import { sendEmailChangeEmail } from "../utils/emails/sendEmailChangeEmail.js";
import { sendPasswordChangeEmail } from "../utils/emails/sendPasswordChangeEmail.js";
import axios from "axios";
import qs from "qs";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${process.env.VITE_API_BASE_URL}/api/auth/google/callback`;
const supabase = connectSupabase();
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- Expiration Time Constants
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// ------------------------------
// USER REGISTRATION
// ------------------------------
export const registerUser = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword)
    return res.status(400).json({ error: "All fields are required" });

  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  if (password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: createUserError } = await supabase
      .from("users")
      .insert([
        {
          full_name: fullName,
          email,
          password: hashedPassword,
          is_verified: false,
        },
      ])
      .select()
      .single();

    if (createUserError) {
      console.error("Supabase user creation error:", createUserError.message);
      return res.status(500).json({ message: "Failed to create user." });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const { error: insertTokenError } = await supabase
      .from("email_verifications")
      .insert([
        {
          user_id: newUser.id,
          token: token,
          expires_at: expiresAt,
        },
      ]);

    if (insertTokenError) {
      console.error(
        "Supabase insert email verification token error:",
        insertTokenError.message
      );
    }

    try {
      await sendSignUpVerificationEmail(
        email,
        newUser.full_name, // Passing user's full name
        `${FRONTEND_URL}/verify-email?token=${token}`
      );
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    res.json({
      message:
        "User registered successfully. Check your email for verification.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// GOOGLE OAUTH
// ------------------------------
export const googleAuthRedirect = async (req, res) => {
  try {
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=openid email profile`;
    res.redirect(googleUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google OAuth failed" });
  }
};

export const googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: "No code provided" });

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token } = tokenRes.data;

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    let userId;
    if (!existingUser) {
      const { data: newUser } = await supabase
        .from("users")
        .insert([{ full_name: name, email, password: "" }])
        .select()
        .single();
      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }

    await supabase.from("refresh_tokens").delete().eq("user_id", userId);

    const accessToken = jwt.sign(
      { id: userId, email, role: existingUser?.role || "user" },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await supabase.from("refresh_tokens").insert([
      {
        user_id: userId,
        token: refreshToken,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      },
    ]);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect(`${FRONTEND_URL}/profile`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google OAuth callback failed" });
  }
};

// ------------------------------
// LOGIN USER
// ------------------------------

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // CRITICAL: Use the service role key to securely fetch the user.
    // This bypasses RLS and ensures the lookup is reliable on the backend.
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // SECURITY FIX: Return a generic message for both "user not found"
    // and "password mismatch" to prevent user enumeration.
    if (userError || !user) {
      console.error(`Login failed for email: ${email}. User not found.`);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Account Lockout Logic (re-structured for clarity)
    if (user.account_locked && user.role !== "admin") {
      const lockDurationMs = 12 * 60 * 60 * 1000;
      const lockedAt = user.lock_time ? new Date(user.lock_time) : null;
      const now = new Date();
      console.log("lockDurationMs", lockDurationMs);
      console.log("lockedAt", lockedAt);
      console.log("now", now);

      // Check if the lock duration has expired
      if (lockedAt && now - lockedAt >= lockDurationMs) {
        // Lock expired, auto-reset the account.
        await supabase
          .from("users")
          .update({
            account_locked: false,
            failed_login_attempts: 0,
            lock_time: null,
          })
          .eq("id", user.id);

        // Update the user object in memory for the rest of the function's execution
        user.account_locked = false;
        user.failed_login_attempts = 0;
      } else {
        // Account is still locked.
        return res.status(403).json({
          message:
            "Your account is locked due to multiple failed attempts. Please try again after 12 Hrs or contact Support.",
        });
      }
    }

    // Password comparison
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Failed login attempt logic
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const shouldLockAccount = failedAttempts >= 5;

      const updateData = {
        failed_login_attempts: failedAttempts,
      };

      if (shouldLockAccount) {
        updateData.account_locked = true;
        updateData.lock_time = new Date().toISOString();
      }

      const { error: err } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (err) {
        console.error("Supabase update error:", err);
      }

      // SECURITY FIX: Always return a generic message on failed login attempt.
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check email verification.
    if (!user.is_verified) {
      return res.status(403).json({
        message:
          "Email not verified. Please verify your email before logging in.",
      });
    }

    // SUCCESSFUL LOGIN: Reset attempts and generate tokens.
    // FIX: Remove redundant `if` check. This update should always run on success.
    await supabase
      .from("users")
      .update({
        failed_login_attempts: 0,
        account_locked: false,
        lock_time: null,
      })
      .eq("id", user.id);

    // Remove old refresh tokens to prevent token reuse.
    await supabase.from("refresh_tokens").delete().eq("user_id", user.id);

    // Generate new access and refresh tokens.
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await supabase.from("refresh_tokens").insert([
      {
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(
          Date.now() + REFRESH_TOKEN_EXPIRY_MS
        ).toISOString(),
      },
    ]);

    // Update last login timestamp
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Set secure HTTP-only cookies.
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error("Server-side error during login:", err);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
};

// ------------------------------
// LOGOUT USER
// ------------------------------
export const logout = async (req, res) => {
  const { refresh_token } = req.cookies;

  if (refresh_token) {
    await supabase.from("refresh_tokens").delete().eq("token", refresh_token);
  }

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ message: "Logged out successfully" });
};

// ------------------------------
// REFRESH ACCESS TOKEN
// ------------------------------
export const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refresh_token;
    if (!oldRefreshToken)
      return res.status(401).json({ message: "No refresh token" });

    const { data: tokenEntry, error: tokenError } = await supabase
      .from("refresh_tokens")
      .select("*")
      .eq("token", oldRefreshToken)
      .single();

    if (
      tokenError ||
      !tokenEntry ||
      new Date(tokenEntry.expires_at) < new Date()
    ) {
      if (tokenEntry) {
        await supabase
          .from("refresh_tokens")
          .delete()
          .eq("token", oldRefreshToken);
      }
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", tokenEntry.user_id)
      .single();

    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    await supabase.from("refresh_tokens").delete().eq("token", oldRefreshToken);
    await supabase.from("refresh_tokens").insert({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Access token refreshed", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};

// ------------------------------
// For Verifying the Email_after rgistration
// ------------------------------
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json("Token is missing!");

    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    const { data, error } = await supabase
      .from("users")
      .update({ is_verified: true })
      .eq("email", email)
      .select();

    if (error) return res.status(500).json("Database error.");

    if (!data || data.length === 0)
      return res.status(404).json("User not found.");

    return res.status(200).json("Email verified successfully!");
  } catch (err) {
    console.error(err);
    if (err.name === "TokenExpiredError")
      return res.status(400).json("Token expired.");
    return res.status(400).json("Invalid token.");
  }
};

// ------------------------------
//verify user
// ------------------------------
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { email } = decoded;

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ------------------------------
// Request Password Change (sends verification email)
// ------------------------------
export const requestPasswordChange = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    const token = jwt.sign({ userId, newPassword }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins  from now

    const { error: insertTokenError } = await supabase
      .from("email_verifications")
      .insert([
        {
          user_id: userId,
          token: token,
          expires_at: expiresAt,
        },
      ]);

    if (insertTokenError) {
      console.error(
        "Failed to insert password change token:",
        insertTokenError
      );
      return res
        .status(500)
        .json({ message: "Failed to create verification token" });
    }

    await sendPasswordChangeEmail(
      user.email,
      user.full_name, // Pass user's full_name
      `${FRONTEND_URL}/verify-password-change?token=${token}`
    );

    return res.json({
      message:
        "Verification email sent. Please check your inbox to confirm password change.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request password change" });
  }
};

// ------------------------------
// Request Email Change (sends verification email to OLD email)
// ------------------------------
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user)
      return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ userId, newEmail }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now

    const { error: insertTokenError } = await supabase
      .from("email_verifications")
      .insert([
        {
          user_id: userId,
          token: token,
          expires_at: expiresAt,
        },
      ]);

    if (insertTokenError) {
      console.error("Failed to insert email change token:", insertTokenError);
      return res
        .status(500)
        .json({ message: "Failed to create verification token" });
    }

    await sendEmailChangeEmail(
      user.email,
      user.full_name, // Pass user's full_name
      `${FRONTEND_URL}/verify-email-change?token=${token}`
    );

    return res.json({
      message:
        "Verification email sent to your current email. Please confirm before updating.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request email change" });
  }
};

// ------------------------------
// Verify Email Change
// ------------------------------
export const verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const payload = jwt.verify(token, JWT_SECRET);

    const { data: verificationRecord, error: verificationError } =
      await supabase
        .from("email_verifications")
        .select("*")
        .eq("token", token)
        .single();

    if (verificationError || !verificationRecord) {
      console.error("Token not found in DB:", verificationError);
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    if (new Date(verificationRecord.expires_at) < new Date()) {
      await supabase.from("email_verifications").delete().eq("token", token);
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    if (payload.userId !== verificationRecord.user_id) {
      return res.status(400).json({ message: "Invalid token." });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ email: payload.newEmail })
      .eq("id", payload.userId);

    if (updateError) {
      console.error("Failed to update email:", updateError);
      return res.status(500).json({ message: "Failed to update email" });
    }

    await supabase.from("email_verifications").delete().eq("token", token);

    res.json({ message: "Email updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// ------------------------------
// Verify Password Change
// ------------------------------
export const verifyPasswordChange = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const payload = jwt.verify(token, JWT_SECRET);

    const { data: verificationRecord, error: verificationError } =
      await supabase
        .from("email_verifications")
        .select("*")
        .eq("token", token)
        .single();

    if (verificationError || !verificationRecord) {
      console.error("Token not found in DB:", verificationError);
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    if (new Date(verificationRecord.expires_at) < new Date()) {
      await supabase.from("email_verifications").delete().eq("token", token);
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    if (payload.userId !== verificationRecord.user_id) {
      return res.status(400).json({ message: "Invalid token." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.newPassword, salt);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", payload.userId);

    if (updateError) {
      console.error("Failed to update password:", updateError);
      return res.status(500).json({ message: "Failed to update password" });
    }

    await supabase.from("email_verifications").delete().eq("token", token);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
