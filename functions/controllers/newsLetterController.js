import express from "express";
const router = express.Router();
import { google } from "googleapis";
// ✅ Import getOAuth2Client instead of getDriveClient for auth purposes
import { initGDrive, getOAuth2Client } from "../utils/gdriveClient.js";

// ✅ Ensure initGDrive() is called once globally in your app's entry point.
// If it's not, calling it here will initialize the client when this router file is imported.
// It's safer to have a single initialization point for all Google API clients.
initGDrive();

// ✅ Get the *OAuth2 authentication client* instance
const authClient = getOAuth2Client();

// Create the Google Sheets client with the authenticated OAuth2 client
const sheets = google.sheets({ version: "v4", auth: authClient }); // ✅ Use authClient here

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res
      .status(400)
      .json({ message: "A valid email address is required." });
  }

  const spreadsheetId = process.env.GDRIVE_GOOGLE_SHEETS_NEWSLETTER_ID;
  const range = "Subscribers!A:B"; // Make sure 'Subscribers' is the correct sheet name in your Google Sheet

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[email, new Date().toLocaleString()]], // Email and Timestamp
      },
    });

    if (response.status === 200) {
      return res.status(200).json({ message: "Subscription successful." });
    } else {
      throw new Error(
        `Google Sheets API returned status code ${response.status}`
      );
    }
  } catch (err) {
    console.error("Subscription failed:", err.message);
    res.status(500).json({ message: "Failed to subscribe. Please try again." });
  }
});

export default router;
