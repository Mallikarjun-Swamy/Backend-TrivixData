// server/utils/emails/sendContactFormEmail.js
import { transporter } from "./emailTransporter.js";
import { emailTemplate } from "./emailTemplate.js";

export const sendContactFormEmail = async (
  userName,
  userEmail,
  userMessage
) => {
  const subject = `New Contact Form Inquiry from ${userName}`;

  // HTML content for the email body, formatted as a table
  const bodyContent = `
    <p>Dear Admin,</p>
    <p>A user has submitted the contact form on your website. Below are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold; width: 30%;">Name:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${userName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold; width: 30%;">Email:</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${userEmail}" style="color: #007bff; text-decoration: none;">${userEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold; width: 30%; vertical-align: top;">Message:</td>
        <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${userMessage}</td>
      </tr>
    </table>
    <p style="margin-top: 20px;">Please respond to the user as soon as possible.</p>
    <p>Thank you,<br/>Your Website Contact Form</p>
  `;

  const mailOptions = {
    from: `"Trivix Data Solutions Contact" <${process.env.SMTP_USER}>`, // Sender email
    to: process.env.SMTP_USER, // Your email address where you want to receive inquiries
    subject: subject,
    html: emailTemplate("Contact Form Submission", bodyContent), // Use your existing email template wrapper
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Contact form email sent successfully!");
  } catch (error) {
    console.error("Error sending contact form email:", error);
    throw new Error("Failed to send contact form email.");
  }
};
