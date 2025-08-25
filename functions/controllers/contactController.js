// server/controllers/contactController.js (or similar)
import { sendContactFormEmail } from "../utils/emails/sendContactFormSubmitEmail.js";

export const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation (you can add more robust validation here)
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Call the new function to send the email
    await sendContactFormEmail(name, email, message);
    res
      .status(200)
      .json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error in contact form submission:", error);
    res
      .status(500)
      .json({ message: "Failed to send message. Please try again later." });
  }
};
