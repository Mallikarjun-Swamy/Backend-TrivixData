// utils/invoiceGenerator.js
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Design constants
const MARGIN = 50;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const PADDING = 15;

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

  // Helper function for drawing rounded rectangles using the correct method
  const drawRoundedRect = (x, y, width, height, radius) => {
    doc.roundedRect(x, y, width, height, radius);
  };

  // === HEADER SECTION ===
  const headerHeight = 100;
  drawRoundedRect(MARGIN, MARGIN, CONTENT_WIDTH, headerHeight, 5);
  doc.fill(COLORS.background).stroke(COLORS.line).fillAndStroke();

  const logoPath = path.join("utils", "logo-bg.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, MARGIN + PADDING, MARGIN + PADDING, { width: 120 });
  }

  // Invoice title
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(COLORS.primary)
    .text("INVOICE", MARGIN + PADDING, MARGIN + PADDING + 5, {
      align: "right",
      width: CONTENT_WIDTH - 2 * PADDING,
    });

  // Invoice details within the header
  const detailY = MARGIN + PADDING + 30;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(`Invoice #: ${invoiceNumber}`, MARGIN + PADDING, detailY, {
      align: "right",
      width: CONTENT_WIDTH - 2 * PADDING,
    })
    .text(
      `Date: ${new Date().toLocaleDateString()}`,
      MARGIN + PADDING,
      detailY + 15,
      { align: "right", width: CONTENT_WIDTH - 2 * PADDING }
    );

  // Handle transaction ID, which might not always exist
  if (payment.paypal_order_id || payment.id) {
    doc.text(
      `Trans ID: ${payment.paypal_order_id || payment.id}`,
      MARGIN + PADDING,
      detailY + 30,
      { align: "right", width: CONTENT_WIDTH - 2 * PADDING }
    );
  }

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
    .text(user.email, MARGIN, infoY + 30);

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
      "support@trivixdatasolutions.com",
      PAGE_WIDTH - MARGIN - 150,
      infoY + 30,
      {
        align: "right",
        width: 150,
      }
    );

  // === ITEMS TABLE ===
  const tableY = infoY + 70;
  const rowHeight = 25;
  const colWidths = {
    description: CONTENT_WIDTH * 0.5,
    qty: CONTENT_WIDTH * 0.1,
    unitPrice: CONTENT_WIDTH * 0.15,
    tax: CONTENT_WIDTH * 0.1,
    total: CONTENT_WIDTH * 0.15,
  };

  // Table Header
  drawRoundedRect(MARGIN, tableY, CONTENT_WIDTH, rowHeight, 3);
  doc.fill(COLORS.background).stroke(COLORS.line).fillAndStroke();

  let currentX = MARGIN;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.primary);
  doc.text("Description", currentX + PADDING, tableY + 8);
  currentX += colWidths.description;
  doc.text("Qty", currentX, tableY + 8, {
    width: colWidths.qty,
    align: "center",
  });
  currentX += colWidths.qty;
  doc.text("Unit Price", currentX, tableY + 8, {
    width: colWidths.unitPrice,
    align: "right",
  });
  currentX += colWidths.unitPrice;
  doc.text("Tax", currentX, tableY + 8, {
    width: colWidths.tax,
    align: "right",
  });
  currentX += colWidths.tax;
  doc.text("Total", currentX, tableY + 8, {
    width: colWidths.total - PADDING,
    align: "right",
  });

  // Item Row
  const itemY = tableY + rowHeight;
  const quantity = 1;
  const totalReceived = Number(payment.amount);
  const unitPriceWithoutTax = (totalReceived - totalReceived * 0.1).toFixed(2);
  const tax = (totalReceived * 0.1).toFixed(2);

  doc.font("Helvetica").fontSize(10).fillColor(COLORS.text);
  currentX = MARGIN;
  doc.text(file.name, currentX + PADDING, itemY + 8, {
    width: colWidths.description,
  });
  currentX += colWidths.description;
  doc.text(quantity, currentX, itemY + 8, {
    width: colWidths.qty,
    align: "center",
  });
  currentX += colWidths.qty;
  doc.text(`$${unitPriceWithoutTax}`, currentX, itemY + 8, {
    width: colWidths.unitPrice,
    align: "right",
  });
  currentX += colWidths.unitPrice;
  doc.text(`$${tax}`, currentX, itemY + 8, {
    width: colWidths.tax,
    align: "right",
  });
  currentX += colWidths.tax;
  doc.text(`$${totalReceived.toFixed(2)}`, currentX, itemY + 8, {
    width: colWidths.total - PADDING,
    align: "right",
  });

  // === TOTALS SECTION (Corrected Spacing) ===
  const totalsY = itemY + rowHeight + 20;
  const totalsX = PAGE_WIDTH - MARGIN - 200;
  const totalsWidth = 200;
  const labelX = MARGIN + 250; // New X position for labels
  const valueX = totalsX; // X position for values (remains the same)

  doc.font("Helvetica").fontSize(12).fillColor(COLORS.text);
  doc.text("Subtotal", labelX, totalsY);
  doc.text(`$${unitPriceWithoutTax}`, valueX, totalsY, {
    width: totalsWidth,
    align: "right",
  });

  doc.text("Tax (10%)", labelX, totalsY + 20);
  doc.text(`$${tax}`, valueX, totalsY + 20, {
    width: totalsWidth,
    align: "right",
  });

  // Final Total
  drawRoundedRect(totalsX, totalsY + 45, totalsWidth, 30, 3);
  doc.fill(COLORS.background).stroke(COLORS.line).fillAndStroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.primary)
    .text("TOTAL", labelX, totalsY + 53); // Moved "TOTAL" label left
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.secondary)
    .text(`$${totalReceived.toFixed(2)}`, valueX, totalsY + 53, {
      width: totalsWidth,
      align: "right",
    });

  // === FOOTER ===
  const footerY = doc.page.height - MARGIN - 40;
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.text)
    .text(
      "This invoice is electronically generated and valid without a signature. Thank you for your business.",
      MARGIN,
      footerY,
      { align: "center", width: CONTENT_WIDTH }
    );

  // === WATERMARK ===
  doc
    .fontSize(60)
    .fillColor(COLORS.text)
    .opacity(0.02)
    .text("TRIVIX", 0, 350, { align: "center" });
  doc.opacity(1);

  doc.end();
  return invoicePath;
};
