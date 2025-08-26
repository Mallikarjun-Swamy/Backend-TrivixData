import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Design constants
const MARGIN = 50;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Color Palette
const COLORS = {
  primary: "#303030", // Dark gray
  secondary: "#007bff", // Blue for accents
  text: "#525252", // Medium gray
  line: "#e6e6e6", // Light gray
  background: "#f9f9f9", // Subtle off-white
};

export const generateInvoice = async (invoiceData) => {
  const { invoiceNumber, user, payment, file } = invoiceData;

  const doc = new PDFDocument({ size: "A4", margin: MARGIN });
  const invoicePath = path.join("tmp", `invoice-${invoiceNumber}.pdf`);
  doc.pipe(fs.createWriteStream(invoicePath));

  // Helper functions for drawing rounded rectangles with a single fill and stroke
  const drawRoundedRect = (x, y, width, height, radius) => {
    doc
      .roundedRect(x, y, width, height, radius)
      .fillAndStroke(COLORS.background, COLORS.line);
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // === HEADER SECTION ===
  const headerHeight = 100;
  // drawRoundedRect(MARGIN - 15, MARGIN, CONTENT_WIDTH + 30, headerHeight, 4);

  const logoPath = path.join("utils", "logo-bg.png");
  const logoWidth = 120;
  const logoX = PAGE_WIDTH - MARGIN - logoWidth - 0; // Adjusted to be 15px from the right edge of the header box
  const logoY = MARGIN + 10;

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, logoX, logoY, { width: logoWidth });
  }

  // Invoice title and details
  const detailY = MARGIN + 15;
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(COLORS.primary)
    .text("INVOICE", MARGIN, detailY, {
      width: CONTENT_WIDTH - 30,
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(`Invoice # : ${invoiceNumber}`, MARGIN, detailY + 30, {
      width: CONTENT_WIDTH - 30,
    })
    .text(`Date : ${new Date().toLocaleDateString()}`, MARGIN, detailY + 45, {
      width: CONTENT_WIDTH - 30,
    });

  if (payment.paypal_order_id || payment.id) {
    doc.text(
      `Transaction ID : ${payment.paypal_order_id || payment.id}`,
      MARGIN,
      detailY + 60,
      {
        width: CONTENT_WIDTH - 30,
      }
    );
  }
  // ---

  // === BILLING INFO & DUE AMOUNT ===
  const billToY = MARGIN + 100;

  // === CUSTOMER & COMPANY INFO ===
  const infoY = MARGIN + headerHeight + 20;

  // Bill To (Left side)
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.primary)
    .text("Bill To:", MARGIN, infoY);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(user.full_name, MARGIN, infoY + 15)
    .text(user.email, MARGIN, infoY + 30)
    .text(
      `${
        user.address +
          ", " +
          user.city +
          ", " +
          user.state +
          " " +
          user.zip_code +
          " " +
          user.country || ""
      }`,
      MARGIN,
      infoY + 45
    );

  // From (Right side)
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.primary)
    .text("From:", PAGE_WIDTH - MARGIN - 150, infoY, {
      align: "right",
      width: 150,
    });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.text)
    .text("Trivix Data Solutions", PAGE_WIDTH - MARGIN - 150, infoY + 15, {
      align: "right",
      width: 150,
    })
    .text(
      "accounts@trivixdatasolutions.com",
      PAGE_WIDTH - MARGIN - 160,
      infoY + 30,
      {
        align: "right",
        width: 160,
      }
    )
    .text(
      `22nd Street, Sacramento, CA 95811 USA`,
      PAGE_WIDTH - MARGIN - 200,
      infoY + 45,
      {
        align: "right",
        width: 200,
      }
    );

  // Due amount section
  const amountDueY = billToY + 70;
  const paidStatusY = infoY + 100;
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(COLORS.primary)
    .text(
      `$${Number(payment.amount).toFixed(2)} Paid on ${formattedDate}`,
      MARGIN,
      paidStatusY
    );
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor(COLORS.text)
    .text("Thanks for doing business with us!", MARGIN, amountDueY + 90);

  // ---

  // === ITEMS TABLE ===
  const tableY = amountDueY + 130;
  const colWidths = [
    CONTENT_WIDTH * 0.5,
    CONTENT_WIDTH * 0.15,
    CONTENT_WIDTH * 0.15,
    CONTENT_WIDTH * 0.2,
  ];

  // Table header
  doc
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(MARGIN, tableY - 10)
    .lineTo(MARGIN + CONTENT_WIDTH, tableY - 10)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.text);
  doc.text("Item Description", MARGIN, tableY);
  doc.text("Qty", MARGIN + colWidths[0] - 30, tableY, {
    width: colWidths[1],
    align: "right",
  });
  doc.text("Unit price", MARGIN + colWidths[0] + colWidths[1], tableY, {
    width: colWidths[2],
    align: "right",
  });
  doc.text(
    "Amount",
    MARGIN + colWidths[0] + colWidths[1] + colWidths[2],
    tableY,
    { width: colWidths[3], align: "right" }
  );

  doc
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(MARGIN, tableY + 15)
    .lineTo(MARGIN + CONTENT_WIDTH, tableY + 15)
    .stroke();

  // Item row
  const itemY = tableY + 25;
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.text);
  doc.text(file.name, MARGIN, itemY);
  doc.text("1", MARGIN + colWidths[0], itemY, {
    width: colWidths[1],
    align: "center",
  });
  doc.text(
    `$${Number(payment.amount).toFixed(2)}`,
    MARGIN + colWidths[0] + colWidths[1],
    itemY,
    { width: colWidths[2], align: "right" }
  );
  doc.text(
    `$${Number(payment.amount).toFixed(2)}`,
    MARGIN + colWidths[0] + colWidths[1] + colWidths[2],
    itemY,
    { width: colWidths[3], align: "right" }
  );

  // ---

  // === TOTALS SECTION ===
  const totalsY = itemY + 50;
  const totalsX = MARGIN + CONTENT_WIDTH / 2;
  const totalsLabelWidth = 100;
  const totalsValueWidth = 100;

  doc.font("Helvetica").fontSize(10).fillColor(COLORS.text);
  doc.text("Subtotal", totalsX, totalsY, { width: totalsLabelWidth });
  doc.text(
    `$${Number(payment.amount).toFixed(2)}`,
    totalsX + totalsLabelWidth + 20,
    totalsY,
    { width: totalsValueWidth, align: "right" }
  );

  doc.text("Total", totalsX, totalsY + 20, { width: totalsLabelWidth });
  doc.text(
    `$${Number(payment.amount).toFixed(2)}`,
    totalsX + totalsLabelWidth + 20,
    totalsY + 20,
    { width: totalsValueWidth, align: "right" }
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.primary)
    .text("Total Paid", totalsX, totalsY + 40, { width: totalsLabelWidth });
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.primary)
    .text(
      `$${Number(payment.amount).toFixed(2)}`,
      totalsX + totalsLabelWidth + 20,
      totalsY + 40,
      { width: totalsValueWidth, align: "right" }
    );

  // === ADDITIONAL ACCOUNTS CONTENT ===
  const contentY = totalsY + 100;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(
      "This invoice serves as a record of your payment and is a testament to the successful completion of the ",
      MARGIN,
      contentY + 80,
      {
        width: CONTENT_WIDTH,
      }
    )
    .text(
      "transaction. For all billing and accounts-related inquiries, please contact us at the details provided above.",
      MARGIN,
      contentY + 95,
      {
        width: CONTENT_WIDTH,
      }
    );

  // === WATERMARK ===
  doc
    .fontSize(60)
    .fillColor(COLORS.text)
    .opacity(0.05)
    .rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] })
    .text("TRIVIX DATA SOLUTIONS", 0, 350, { align: "center" })
    .rotate(45, { origin: [doc.page.width / 2, doc.page.height / 2] });

  doc.opacity(1);

  // === FOOTER ===
  doc
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(MARGIN, tableY + 390)
    .lineTo(MARGIN + CONTENT_WIDTH + 20, tableY + 390)
    .stroke();
  const footerY = doc.page.height - MARGIN - 40;
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.text)
    .text(
      "Trivix Data Solutions - 22nd Street, Sacramento, CA 95811 USA • All Rights Reserved",
      MARGIN,
      footerY,
      { align: "center", width: CONTENT_WIDTH }
    );

  doc.end();
  return invoicePath;
};
