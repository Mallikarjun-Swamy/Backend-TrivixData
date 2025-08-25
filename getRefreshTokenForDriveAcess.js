//before running the scrit do npm init and install below depedencies

import { google } from "googleapis";
import readline from "readline";

// add this details from google cloud console, to get refresh token

const GDRIVE_CLIENT_ID = "";
const GDRIVE_CLIENT_SECRET = "";
const GDRIVE_REDIRECT_URI = "";

const oauth2Client = new google.auth.OAuth2(
  GDRIVE_CLIENT_ID,
  GDRIVE_CLIENT_SECRET,
  GDRIVE_REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("📎 Authorize this app by visiting this URL:\n", authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\n🔑 Enter the code from that page here: ", async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log("\n✅ Your refresh_token:\n", tokens.refresh_token);
});
