// // backend/config.js

// import { defineSecret } from "firebase-functions/params";

// // Define the secrets for production deployment. These calls are "lazy"
// // and only fetch values when the function is deployed.
// const JWT_SECRET_PROD = defineSecret("JWT_SECRET");
// const GOOGLE_CLIENT_ID_PROD = defineSecret("GOOGLE_CLIENT_ID");
// const GOOGLE_CLIENT_SECRET_PROD = defineSecret("GOOGLE_CLIENT_SECRET");
// const GOOGLE_REDIRECT_URI_PROD = defineSecret("GOOGLE_REDIRECT_URI");

// // We use a mutable 'config' object to hold our final values
// const config = {};

// // Use an IIFE (Immediately Invoked Function Expression) to handle async logic
// // This pattern ensures the config is populated before being used.
// (async () => {
//   // Check for the Firebase Functions Emulator environment variable.
//   // This is how we know if we're running locally or not.

//   // Local Development Configuration
//   // Values are pulled from your local .env file.
//   //
//   if (process.env.FIREBASE_FUNCTIONS_EMULATOR) {
//     config.FRONTEND_URL = process.env.FRONTEND_URL;
//     config.NODE_ENV = process.env.NODE_ENV;
//     config.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL;
//     config.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
//     config.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
//     config.PAYPAL_ENV = process.env.PAYPAL_ENV;
//     config.SMTP_USER = process.env.SMTP_USER;
//     config.SMTP_PASS = process.env.SMTP_PASS;
//     config.SMTP_HOST = process.env.SMTP_HOST;
//     config.SMTP_PORT = process.env.SMTP_PORT;
//     config.JWT_SECRET = process.env.JWT_SECRET;
//     config.SUPABASE_URL = process.env.SUPABASE_URL;
//     config.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
//     config.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
//     config.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
//     config.GDRIVE_CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
//     config.GDRIVE_CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
//     config.GDRIVE_REDIRECT_URI = process.env.GDRIVE_REDIRECT_URI;
//     config.GDRIVE_REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;
//     config.GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
//     config.GDRIVE_SAMPLE_FOLDER_ID = process.env.GDRIVE_SAMPLE_FOLDER_ID;
//     config.GDRIVE_GOOGLE_SHEETS_NEWSLETTER_ID =
//       process.env.GDRIVE_GOOGLE_SHEETS_NEWSLETTER_ID;
//   } else {
//     //
//     // Production Deployment Configuration
//     //
//     // Values are fetched from Firebase Secret Manager.
//     config.FRONTEND_URL = defineSecret("FRONTEND_URL").value();
//     config.NODE_ENV = defineSecret("JWT_SECRET").value();
//     config.VITE_API_BASE_URL = defineSecret("VITE_API_BASE_URL").value();
//     config.PAYPAL_CLIENT_ID = defineSecret("JWT_SECRET").value();
//     config.PAYPAL_CLIENT_SECRET = defineSecret("JWT_SECRET").value();
//     config.PAYPAL_ENV = defineSecret("JWT_SECRET").value();
//     config.SMTP_USER = defineSecret("JWT_SECRET").value();
//     config.SMTP_PASS = defineSecret("JWT_SECRET").value();
//     config.SMTP_HOST = defineSecret("JWT_SECRET").value();
//     config.SMTP_PORT = defineSecret("JWT_SECRET").value();
//     config.JWT_SECRET = defineSecret("JWT_SECRET").value();
//     config.SUPABASE_URL = defineSecret("JWT_SECRET").value();
//     config.SUPABASE_SERVICE_KEY = defineSecret("JWT_SECRET").value();
//     config.GOOGLE_CLIENT_ID = defineSecret("JWT_SECRET").value();
//     config.GOOGLE_CLIENT_SECRET = defineSecret("JWT_SECRET").value();
//     config.GDRIVE_CLIENT_ID = defineSecret("JWT_SECRET").value();
//     config.GDRIVE_CLIENT_SECRET = defineSecret("JWT_SECRET").value();
//     config.GDRIVE_REDIRECT_URI = defineSecret("JWT_SECRET").value();
//     config.GDRIVE_REFRESH_TOKEN = defineSecret("GDRIVE_REFRESH_TOKEN").value();
//     config.GDRIVE_FOLDER_ID = defineSecret("GDRIVE_FOLDER_ID").value();
//     config.GDRIVE_SAMPLE_FOLDER_ID = defineSecret(
//       "GDRIVE_SAMPLE_FOLDER_ID"
//     ).value();
//     config.GDRIVE_GOOGLE_SHEETS_NEWSLETTER_ID = defineSecret(
//       "GDRIVE_GOOGLE_SHEETS_NEWSLETTER_ID"
//     ).value();
//   }
// })();

// // Export the config object for use in other files
// export { config };
