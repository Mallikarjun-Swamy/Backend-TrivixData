import { transporter } from "./emailTransporter.js";
import { emailTemplate } from "./emailTemplate.js";
import { generateInvoice } from "../invoiceGenerator.js";

export const sendPaymentSuccessEmail = async (user, payment, file) => {
  const invoiceNumber = `INV-TX${Date.now()}`;
  const invoicePath = await generateInvoice({
    invoiceNumber,
    user,
    payment,
    file,
  });

  const myDownloadsLink = `${process.env.FRONTEND_URL}/profile/downloads`;

  const bodyContent = `
    <p>Hello ${user.full_name},</p>
    <p>Thank you for your recent purchase! Your payment for **${file.name}** was successful.</p>

    <p>Here are your order details for your records:</p>
    <ul style="list-style-type: none; padding-left: 0;">
      <li><strong>Item:</strong> ${file.name}</li>
      <li><strong>Amount Paid:</strong> $${payment.amount} ${payment.currency}</li>
      <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
    </ul>

    <p>Your purchased file is now available in your account. Click the button below to go to your downloads section and access your file.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${myDownloadsLink}" target="_blank" style="
        background-color: #007bff;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 6px;
        font-weight: 600;
        display: inline-block;
        font-size: 16px;
        letter-spacing: 0.5px;
      ">Access My File</a>
    </div>

    <p>A copy of your invoice has been attached to this email for your convenience.</p>
    <p>Thank you for choosing Trivix,<br/>The Trivix Team</p>
  `;

  await transporter.sendMail({
    from: `"Trivix Data Solutions" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Your Payment for "${file.name}" Was Successful! 🎉`,
    html: emailTemplate("Payment Successful", bodyContent),
    attachments: [
      {
        filename: `Invoice-${invoiceNumber}.pdf`,
        path: invoicePath,
        contentType: "application/pdf",
      },
    ],
  });

  return invoicePath; // ✅ FIX: Return the file path after sending the email
};
