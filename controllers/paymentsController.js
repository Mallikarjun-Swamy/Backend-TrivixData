// // server/controllers/paymentController.js
// import fs from "fs";
// import path from "path";
// import paypal from "@paypal/checkout-server-sdk";
// import client from "../utils/paypalClient.js";
// import { connectSupabase } from "../db/supabase.js";
// import crypto from "crypto";
// import { sendPaymentSuccessEmail } from "..//utils/emails/sendPaymentSuccessEmail.js"; // Ensure this path is correct

// const supabase = connectSupabase();

// export const createOrder = async (req, res) => {
//   try {
//     const { fileId } = req.body;
//     if (!fileId) return res.status(400).json({ message: "fileId required" });

//     // Fetch file using new schema
//     const { data: file, error } = await supabase
//       .from("files")
//       .select("id, name, price, gdrive_url, gdrive_file_id") // updated columns
//       .eq("id", fileId)
//       .single();

//     if (error || !file)
//       return res.status(404).json({ message: "File not found" });

//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer("return=representation");
//     request.requestBody({
//       intent: "CAPTURE",
//       purchase_units: [
//         {
//           amount: {
//             currency_code: "USD",
//             value: (file.price || 0).toFixed(2).toString(),
//           },
//           description: `Purchase: ${file.name}`,
//           custom_id: file.id,
//         },
//       ],
//       application_context: {
//         return_url: `${process.env.FRONTEND_URL}/payment/${fileId}`,
//         cancel_url: `${process.env.FRONTEND_URL}/payment/${fileId}`,
//       },
//     });

//     const order = await client().execute(request);
//     return res.json({ id: order.result.id });
//   } catch (err) {
//     console.error("createOrder error:", err);
//     return res.status(500).json({ message: "Failed to create order" });
//   }
// };

// export const captureOrder = async (req, res) => {
//   try {
//     const { orderId, fileId } = req.body;
//     if (!orderId || !fileId)
//       return res.status(400).json({ message: "Missing params" });

//     const request = new paypal.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});

//     const capture = await client().execute(request);
//     const status = capture.result.status;

//     let downloadToken = null;
//     let paymentId = null;

//     const payerEmail =
//       capture.result.payer?.email_address || "unknown@example.com";

//     if (status === "COMPLETED") {
//       const captureUnit = capture.result.purchase_units?.[0];
//       const captureObj = captureUnit?.payments?.captures?.[0];

//       const amount =
//         captureObj?.amount?.value ?? captureUnit?.amount?.value ?? "0";

//       const { data: insertedPayments, error: payErr } = await supabase
//         .from("payments")
//         .insert([
//           {
//             user_id: req.user.id,
//             file_id: fileId,
//             paypal_order_id: orderId,
//             amount: amount,
//             status: "completed",
//             payment_method: "paypal",
//             payer_email: payerEmail,
//           },
//         ])
//         .select("*")
//         .single();

//       if (payErr) {
//         console.error("Failed to insert payment:", payErr);
//       } else {
//         paymentId = insertedPayments.id;
//         console.log("Inserted payment id:", paymentId);
//       }

//       const token = crypto.randomBytes(24).toString("hex");
//       const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

//       const { error: dlErr } = await supabase.from("downloads").insert([
//         {
//           user_id: req.user.id,
//           file_id: fileId,
//           download_url: token,
//           downloaded: false,
//           download_count: 0,
//           created_at: new Date(),
//           expires_at: expiresAt,
//           payment_id: paymentId,
//         },
//       ]);

//       if (dlErr) console.error("Failed to insert download row:", dlErr);

//       downloadToken = token;

//       Promise.all([
//         supabase.from("files").select("*").eq("id", fileId).single(),
//         supabase.from("users").select("*").eq("id", req.user.id).single(),
//       ])
//         .then(async ([{ data: fileDetails }, { data: userDetails }]) => {
//           if (fileDetails && userDetails && insertedPayments) {
//             try {
//               // Assuming sendPaymentSuccessEmail returns the path to the temporary file
//               const filePath = await sendPaymentSuccessEmail(
//                 userDetails,
//                 insertedPayments,
//                 fileDetails
//               );
//               console.log("Payment success email sent in background.");

//               // ✅ FIX: Delete the file after the email is sent
//               if (filePath) {
//                 fs.unlink(filePath, (err) => {
//                   if (err) console.error("Error deleting temp file:", err);
//                   else
//                     console.log("Temporary invoice file deleted successfully.");
//                 });
//               }
//             } catch (emailError) {
//               console.error("Error sending payment success email:", emailError);
//             }
//           } else {
//             console.warn(
//               "Could not send payment success email due to missing user or file details."
//             );
//           }
//         })
//         .catch((dbFetchError) => {
//           console.error(
//             "Error fetching details for payment success email:",
//             dbFetchError
//           );
//         });
//     } else {
//       const { error: payErr } = await supabase.from("payments").insert([
//         {
//           user_id: req.user.id,
//           file_id: fileId,
//           paypal_order_id: orderId,
//           amount: 0,
//           status: status.toLowerCase(),
//           payment_method: "paypal",
//           payer_email: payerEmail,
//         },
//       ]);
//       if (payErr) console.error("Failed to insert payment row:", payErr);
//     }

//     return res.json({ status, downloadToken });
//   } catch (err) {
//     console.error("captureOrder error:", err);
//     return res.status(500).json({ message: "Failed to capture order" });
//   }
// };

// // POST /api/payments/check
// export const checkPayment = async (req, res) => {
//   try {
//     const { fileId } = req.body;
//     if (!fileId) return res.status(400).json({ message: "fileId required" });

//     const { data: payment } = await supabase
//       .from("payments")
//       .select("status, created_at")
//       .eq("user_id", req.user.id)
//       .eq("file_id", fileId)
//       .order("created_at", { ascending: false })
//       .limit(1)
//       .single();

//     if (!payment) return res.json({ status: "not_found" });

//     return res.json({ status: payment.status });
//   } catch (err) {
//     console.error("checkPayment error:", err);
//     return res.status(500).json({ message: "Failed to check payment" });
//   }
// };

import fs from "fs";
import path from "path";
import paypal from "@paypal/checkout-server-sdk";
import client from "../utils/paypalClient.js";
import { connectSupabase } from "../db/supabase.js";
import crypto from "crypto";
import { sendPaymentSuccessEmail } from "../utils/emails/sendPaymentSuccessEmail.js";

const supabase = connectSupabase();

export const createOrder = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ message: "fileId required" });

    const { data: file, error } = await supabase
      .from("files")
      .select("id, name, price, gdrive_url, gdrive_file_id")
      .eq("id", fileId)
      .single();

    if (error || !file) {
      console.error("createOrder file fetch error:", error?.message);
      return res.status(404).json({ message: "File not found" });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: Number(file.price || 0)
              .toFixed(2)
              .toString(),
          },
          description: `Purchase: ${file.name}`,
          custom_id: file.id,
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment/${fileId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/${fileId}`,
      },
    });

    const order = await client().execute(request);
    return res.json({ id: order.result.id });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

export const captureOrder = async (req, res) => {
  try {
    const { orderId, fileId } = req.body;
    if (!orderId || !fileId)
      return res.status(400).json({ message: "Missing params" });
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Authentication required" });

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client().execute(request);
    const status = capture.result.status;

    let downloadToken = null;
    let paymentId = null;

    const payerEmail =
      capture.result.payer?.email_address ||
      req.user.email ||
      "unknown@example.com";

    if (status === "COMPLETED") {
      const captureUnit = capture.result.purchase_units?.[0];
      const captureObj = captureUnit?.payments?.captures?.[0];
      const amount =
        captureObj?.amount?.value ?? captureUnit?.amount?.value ?? "0";

      const { data: insertedPayments, error: payErr } = await supabase
        .from("payments")
        .insert([
          {
            user_id: req.user.id,
            file_id: fileId,
            paypal_order_id: orderId,
            amount: amount,
            status: "completed",
            payment_method: "paypal",
            payer_email: payerEmail,
          },
        ])
        .select("*")
        .single();

      if (payErr) {
        console.error("Failed to insert completed payment:", payErr);
      } else {
        paymentId = insertedPayments.id;
        const token = crypto.randomBytes(24).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const { error: dlErr } = await supabase.from("downloads").insert([
          {
            user_id: req.user.id,
            file_id: fileId,
            download_url: token,
            downloaded: false,
            download_count: 0,
            expires_at: expiresAt,
            payment_id: paymentId,
          },
        ]);
        if (dlErr) {
          console.error("Failed to insert download row:", dlErr);
        } else {
          downloadToken = token;
        }

        Promise.all([
          supabase.from("files").select("*").eq("id", fileId).single(),
          supabase.from("users").select("*").eq("id", req.user.id).single(),
        ])
          .then(async ([{ data: fileDetails }, { data: userDetails }]) => {
            if (fileDetails && userDetails && insertedPayments) {
              try {
                const filePath = await sendPaymentSuccessEmail(
                  userDetails,
                  insertedPayments,
                  fileDetails
                );
                if (filePath) {
                  fs.unlink(filePath, (err) => {
                    if (err)
                      console.error("Error deleting temp invoice file:", err);
                  });
                }
              } catch (emailError) {
                console.error(
                  "Error sending payment success email:",
                  emailError
                );
              }
            }
          })
          .catch((dbFetchError) => {
            console.error(
              "Error fetching details for payment success email:",
              dbFetchError
            );
          });
      }
    } else {
      const { error: payErr } = await supabase.from("payments").insert([
        {
          user_id: req.user.id,
          file_id: fileId,
          paypal_order_id: orderId,
          amount: 0,
          status: status.toLowerCase(),
          payment_method: "paypal",
          payer_email: payerEmail,
        },
      ]);
      if (payErr)
        console.error("Failed to insert non-completed payment row:", payErr);
    }

    return res.json({ status, downloadToken });
  } catch (err) {
    console.error("captureOrder error:", err);
    return res.status(500).json({ message: "Failed to capture order" });
  }
};

export const checkPayment = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ message: "fileId required" });
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Authentication required" });

    const { data: payment, error } = await supabase
      .from("payments")
      .select("status, created_at")
      .eq("user_id", req.user.id)
      .eq("file_id", fileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is for "not found"
      console.error("checkPayment DB error:", error);
    }

    if (!payment) return res.json({ status: "not_found" });

    return res.json({ status: payment.status });
  } catch (err) {
    console.error("checkPayment error:", err);
    return res.status(500).json({ message: "Failed to check payment" });
  }
};
