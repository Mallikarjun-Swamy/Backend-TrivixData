import { getDriveClient } from "../utils/gdriveClient.js";
import { connectSupabase } from "../db/supabase.js";
import crypto from "crypto";
import { sendFileDownloadSuccessEmail } from "../utils/emails/sendFileDownloadSuccessEmail.js";

const supabase = connectSupabase();

export const downloadFile = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: "Token required" });
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Authentication required" });

    const { data: downloadRow, error: dlErr } = await supabase
      .from("downloads")
      .select("id, file_id, download_count, expires_at, user_id")
      .eq("download_url", token)
      .single();

    if (dlErr || !downloadRow) {
      console.error(
        "Download token validation error:",
        dlErr?.message || "Invalid token"
      );
      return res.status(404).json({ message: "Invalid or expired token" });
    }
    if (new Date(downloadRow.expires_at) < new Date()) {
      return res.status(403).json({ message: "Token expired" });
    }
    if (downloadRow.user_id !== req.user.id) {
      console.warn(
        `Attempted download with token mismatch for user ${req.user.id}`
      );
      return res.status(403).json({ message: "Access forbidden." });
    }

    const { data: file, error: fileErr } = await supabase
      .from("files")
      .select("*")
      .eq("id", downloadRow.file_id)
      .single();

    if (fileErr || !file) {
      console.error("File not found error:", fileErr?.message);
      return res.status(404).json({ message: "File not found" });
    }

    const drive = getDriveClient();

    const response = await drive.files.get(
      { fileId: file.gdrive_file_id, alt: "media" },
      { responseType: "stream" }
    );

    const contentType =
      response.headers["content-type"] || "application/octet-stream";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.name || "download"}"`
    );
    res.setHeader("Content-Type", contentType);

    response.data
      .on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      })
      .pipe(res);

    const { error: upDateErr } = await supabase
      .from("downloads")
      .update({
        downloaded: true,
        download_count: (downloadRow.download_count || 0) + 1,
        last_downloaded_at: new Date(),
      })
      .eq("id", downloadRow.id);

    if (upDateErr) {
      console.error("Failed to update download row:", upDateErr);
    } else {
      const { data: userDetails, error: userErr } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", req.user.id)
        .single();
      if (userErr || !userDetails) {
        console.error("Could not fetch user details for email:", userErr);
      } else {
        try {
          await sendFileDownloadSuccessEmail(userDetails, file);
        } catch (emailError) {
          console.error("Error in sending Email:", emailError);
        }
      }
    }
  } catch (err) {
    console.error("Download error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to download file" });
    }
  }
};

export const checkDownloadToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const { data: downloadRow, error: dlErr } = await supabase
      .from("downloads")
      .select("id, file_id, expires_at, user_id")
      .eq("download_url", token)
      .single();

    if (dlErr || !downloadRow) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }
    if (new Date(downloadRow.expires_at) < new Date()) {
      return res.status(403).json({ message: "Token expired" });
    }
    if (downloadRow.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access forbidden." });
    }

    const { data: file, error: fileErr } = await supabase
      .from("files")
      .select("name, price, description, gdrive_file_id, file_ext")
      .eq("id", downloadRow.file_id)
      .single();

    if (fileErr || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ file });
  } catch (err) {
    console.error("Check token error:", err);
    res.status(500).json({ message: "Failed to check download token" });
  }
};

export const downloadAgain = async (req, res) => {
  try {
    const { fileId, paymentId } = req.body;
    const userId = req.user?.id;

    if (!fileId || !paymentId || !userId) {
      return res
        .status(400)
        .json({ message: "File ID, Payment ID, and User ID required" });
    }

    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("user_id")
      .eq("id", paymentId)
      .eq("user_id", userId)
      .eq("file_id", fileId)
      .eq("status", "completed")
      .single();

    if (payErr || !payment) {
      return res
        .status(403)
        .json({ message: "Payment not completed or access forbidden" });
    }

    const { data: downloadRow, error: dlErr } = await supabase
      .from("downloads")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    if (dlErr || !downloadRow) {
      return res
        .status(404)
        .json({ message: "Download record not found for this payment" });
    }

    const { data: file, error: fileErr } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileErr || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    const drive = getDriveClient();
    const response = await drive.files.get(
      { fileId: file.gdrive_file_id, alt: "media" },
      { responseType: "stream" }
    );

    const contentType =
      response.headers["content-type"] || "application/octet-stream";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.name || "download"}${
        file.file_ext ? "." + file.file_ext : ""
      }"`
    );
    res.setHeader("Content-Type", contentType);

    response.data
      .on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) res.status(500).end();
      })
      .pipe(res);

    const { error: updateErr } = await supabase
      .from("downloads")
      .update({
        downloaded: true,
        download_count: (downloadRow.download_count || 0) + 1,
        last_downloaded_at: new Date(),
      })
      .eq("id", downloadRow.id);

    if (updateErr) {
      console.error("Failed to update download row:", updateErr);
    } else {
      const { data: userDetails, error: userErr } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", userId)
        .single();

      if (userErr || !userDetails) {
        console.error("Could not fetch user details for email:", userErr);
      } else {
        try {
          await sendFileDownloadSuccessEmail(userDetails, file);
        } catch (emailErr) {
          console.error("Failed to send download success email:", emailErr);
        }
      }
    }
  } catch (err) {
    console.error("Download Again error:", err);
    if (!res.headersSent)
      res.status(500).json({ message: "Failed to download file" });
  }
};
