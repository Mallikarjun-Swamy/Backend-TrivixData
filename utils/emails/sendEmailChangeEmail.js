import { transporter } from "./emailTransporter.js";
import { emailTemplate } from "./emailTemplate.js";

export const sendEmailChangeEmail = async (to, userName, verificationUrl) => {
  const bodyContent = `
    <p>Hello ${userName},</p>
    <p>We've received a request to change the email address associated with your Trivix Data Solutions account. To complete this process and secure your account, please click the button below to verify your new email address:</p>
    
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
      ">Verify My New Email Address</a>
    </div>

    <p>This link will expire in 15 mins for security reasons. If you did not initiate this request, please disregard this email or contact our support team immediately.</p>
    <p>Thank you,<br/>The Trivix Team</p>
  `;

  const mailOptions = {
    from: `"Trivix Data Solutions" <${process.env.SMTP_USER}>`,
    to,
    subject: "Action Required: Verify Your New Email Address",
    html: emailTemplate("Verify Your New Email Address", bodyContent),
  };

  await transporter.sendMail(mailOptions);
  console.log("Email change verification sent");
};
