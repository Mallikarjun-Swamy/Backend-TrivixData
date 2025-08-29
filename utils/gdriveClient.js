import { google } from "googleapis";

let drive;
let oAuth2ClientInstance; // ✅ Store the OAuth2 client instance

export const initGDrive = () => {
  if (
    !process.env.GDRIVE_CLIENT_ID ||
    !process.env.GDRIVE_CLIENT_SECRET ||
    !process.env.GDRIVE_REFRESH_TOKEN
  ) {
    throw new Error("Missing Google Drive OAuth2 credentials in .env");
  }

  // 1️⃣ Create OAuth2 client
  oAuth2ClientInstance = new google.auth.OAuth2( // ✅ Assign to oAuth2ClientInstance
    process.env.GDRIVE_CLIENT_ID,
    process.env.GDRIVE_CLIENT_SECRET,
    process.env.GDRIVE_REDIRECT_URI
  );

  // 2️⃣ Set refresh token
  oAuth2ClientInstance.setCredentials({
    refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
  });

  // 3️⃣ Create Drive client with OAuth2
  drive = google.drive({ version: "v3", auth: oAuth2ClientInstance });

  console.log("✅ Google Drive client initialized using OAuth2");
};

// ✅ New export: Get the OAuth2 client directly for other Google APIs
export const getOAuth2Client = () => {
  if (!oAuth2ClientInstance) {
    throw new Error(
      "Google Drive OAuth2 client not initialized. Call initGDrive first."
    );
  }
  return oAuth2ClientInstance;
};

// Keep this export if you still need the Google Drive service client directly
export const getDriveClient = () => {
  if (!drive) {
    throw new Error(
      "Google Drive client not initialized. Call initGDrive first."
    );
  }
  return drive;
};
