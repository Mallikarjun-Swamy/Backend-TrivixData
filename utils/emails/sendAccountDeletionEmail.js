// server/utils/emails/sendAccountDeletionEmail.js
import { transporter } from "./emailTransporter.js";
import { emailTemplate } from "./emailTemplate.js";

export const sendAccountDeletionEmail = async (userEmail, userName) => {
  const subject = `Account Deletion Confirmation`;

  const bodyContent = `
    <p>Dear ${userName},</p>
    <p>This email confirms that your account with Trivix Data Solutions has been successfully and permanently deleted as per your request.</p>
    
    <p>All of your data, including your profile information and purchase history, has been removed from our system. If you change your mind and would like to use our services again in the future, you will need to create a new account.</p>

    <p style="margin-top: 20px;">If you did not request this action, please contact our support team immediately at <a href="mailto:support@trivixdatasolutions.com" style="color: #007bff; text-decoration: none;">support@trivixdatasolutions.com</a>.</p>
    
    <p>Thank you for using our services.</p>
    <p>The Trivix Team</p>
  `;

  const mailOptions = {
    from: `"Trivix Data Solutions" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: subject,
    html: emailTemplate("Account Deletion Confirmation", bodyContent),
  };

  await transporter.sendMail(mailOptions);
};
