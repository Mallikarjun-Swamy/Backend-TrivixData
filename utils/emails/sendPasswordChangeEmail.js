import { transporter } from "./emailTransporter.js";
import { emailTemplate } from "./emailTemplate.js";

export const sendPasswordChangeEmail = async (
  to,
  userName,
  verificationUrl
) => {
  const bodyContent = `
    <p>Hello ${userName},</p>
    <p>We've received a request to reset your password for your Trivix Data Solutions account. To proceed, please click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" target="_blank" style="
        background-color: #007bff;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 6px;
        font-weight: 600;
        display: inline-block;
        font-size: 16px;
        letter-spacing: 0.5px;
      ">Reset My Password</a>
    </div>

    <p>This link is valid for a limited time. If you did not request a password change, please disregard this email or contact our support team immediately to secure your account.</p>
    <p>Thank you,<br/>The Trivix Team</p>
  `;

  const mailOptions = {
    from: `"Trivix Data Solutions" <${process.env.SMTP_USER}>`,
    to,
    subject: "Password Reset Request for Your Trivix Account",
    html: emailTemplate("Password Reset Request", bodyContent),
  };

  await transporter.sendMail(mailOptions);
};
