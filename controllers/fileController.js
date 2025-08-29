import dotenv from "dotenv";
import { connectSupabase } from "../db/supabase.js";
import fs from "fs";
import { getDriveClient } from "../utils/gdriveClient.js";

const supabase = connectSupabase();
dotenv.config();
/**
 * Middleware to check if the authenticated user is an admin.
 * Assumes authMiddleware has already run and populated req.user.
 */
export const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

/**
 * Check if file exists in Google Drive
 */
const checkFileExistsInDrive = async (fileId) => {
  try {
    const drive = getDriveClient();
    await drive.files.get({ fileId, fields: "id" });
    return true;
  } catch (err) {
    if (err.code === 404) return false;
    console.error("Error checking file in Drive:", err.message);
    return false;
  }
};

/**
 * Get all files with availability status
 */
export const getAllFiles = async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const filesWithStatus = await Promise.all(
      files.map(async (file) => {
        const exists = await checkFileExistsInDrive(file.gdrive_file_id);
        return { ...file, status: exists ? "Available" : "Missing" };
      })
    );

    res.json(filesWithStatus);
  } catch (err) {
    console.error("getAllFiles error:", err.message);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

/**
 * Upload files to Google Drive + Supabase
 */
export const uploadFileToDrive = async (req, res) => {
  try {
    const file = req.file;
    const { description, price, listType } = req.body;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // 🐛 Fix: Ensure req.user and req.user.id are available from middleware
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User ID missing." });
    }

    const fileNameOnly = file.originalname.split(".").slice(0, -1).join(".");
    const fileExtOnly = file.originalname.split(".").pop();

    const drive = getDriveClient();

    let parentFolderId;
    if (listType === "Sample") {
      parentFolderId = process.env.GDRIVE_SAMPLE_FOLDER_ID;

      const { data: existingFile, error: checkError } = await supabase
        .from("files")
        .select("name")
        .ilike("name", fileNameOnly);

      if (checkError) {
        return res.status(500).json({ message: checkError.message });
      }
      if (!existingFile || existingFile.length === 0) {
        return res
          .status(400)
          .json({ message: "Sample file name does not match any Full List" });
      }
    } else {
      parentFolderId = process.env.GDRIVE_FOLDER_ID;
    }

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [parentFolderId],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      },
      fields: "id, name",
    });

    const fileId = response.data.id;
    const gdriveUrl = `https://drive.google.com/file/d/${fileId}/view`;

    if (listType === "Sample") {
      return res.json({
        success: true,
        message: "Sample file uploaded to Drive only",
        gdrive_file_id: fileId,
        gdrive_url: gdriveUrl,
      });
    }

    const { data: newFile, error } = await supabase
      .from("files")
      .insert([
        {
          name: fileNameOnly,
          description,
          gdrive_file_id: fileId,
          gdrive_url: gdriveUrl,
          file_size: file.size,
          file_ext: fileExtOnly,
          price,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ success: true, file: newFile });
  } catch (err) {
    console.error("File upload error:", err);
    res
      .status(500)
      .json({ message: "Failed to upload file", error: err.message });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
};

/**
 * Update file data (and rename in Drive if name changes)
 */
export const updateFileData = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, is_active } = req.body;
  const drive = getDriveClient();

  try {
    // 🔐 Security: No need to check ownership if admin-only, but still fetch the file
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (name && name !== file.name) {
      await drive.files.update({
        fileId: file.gdrive_file_id,
        requestBody: { name: `${name}.${file.file_ext}` },
      });
    }

    const { data, error } = await supabase
      .from("files")
      .update({ name, description, price, is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ file: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update file" });
  }
};

/**
 * Delete file from Drive + Supabase
 */
export const deleteFile = async (req, res) => {
  const { id, gid } = req.params;

  const drive = getDriveClient();

  try {
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !file)
      return res.status(404).json({ message: "File not found" });

    // 🐛 Bug Fix: Delete from Drive first to prevent orphaned files
    try {
      if (checkFileExistsInDrive(gid)) {
        await drive.files.delete({ fileId: file.gdrive_file_id });
      }
    } catch (driveErr) {
      console.error("Failed to delete file from Drive:", driveErr);
      // It's acceptable to continue here, as we can't recover a Google Drive file,
      // but we should clean up the DB record.
    }

    await supabase.from("files").delete().eq("id", id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete file" });
  }
};
