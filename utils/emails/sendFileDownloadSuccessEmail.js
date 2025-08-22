import { transporter } from "./emailTransporter.js";
import { emailTemplate } from "./emailTemplate.js";

export const sendFileDownloadSuccessEmail = async (user, file) => {
  const bodyContent = `
    <p>Hello ${user.full_name},</p>
    <p>We're happy to inform you that your recent download for **${file.name}** was successful! You now have full access to your digital asset.</p>
    <p>You can manage and re-download this file at any time by visiting the **My Downloads** section of your account. We recommend saving this email for your records.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard/downloads" target="_blank" style="
        background-color: #007bff;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 6px;
        font-weight: 600;
        display: inline-block;
        font-size: 16px;
        letter-spacing: 0.5px;
      ">Go to My Downloads</a>
    </div>

    <p>If you have any questions or require assistance, please don't hesitate to contact our support team.</p>
    <p>Thank you,<br/>The Trivix Team</p>
  `;

  await transporter.sendMail({
    from: `"Trivix Data Solutions" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Your Download for "${file.name}" is Complete`,
    html: emailTemplate("Download Complete", bodyContent),
  });

  console.log("File download success email sent");
};
