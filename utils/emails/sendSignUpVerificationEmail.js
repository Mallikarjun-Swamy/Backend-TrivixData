import { transporter } from "./emailTransporter.js";
import { emailTemplate } from "./emailTemplate.js";

// Send verification email
export const sendSignUpVerificationEmail = async (
  to,
  name,
  verificationUrl
) => {
  const bodyContent = `
    <p>Hello ${name},</p>
    <p>Welcome to the Trivix community! We're excited to have you on board. Before you get started, please confirm your email address by clicking the button below:</p>
    
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
      ">Verify My Email</a>
    </div>

    <p>This verification link will expire in 1 hours. If you did not sign up for an account with us, please disregard this email.</p>
    <p>Welcome aboard,<br/>The Trivix Team</p>
  `;

  const mailOptions = {
    from: `"Trivix Data Solutions" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to Trivix Data Solutions! Please Verify Your Email",
    html: emailTemplate("Welcome to Trivix Data Solutions", bodyContent),
  };

  await transporter.sendMail(mailOptions);
};
