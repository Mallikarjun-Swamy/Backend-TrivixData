import dotenv from "dotenv";
import fs from "fs";
import { getDriveClient } from "../utils/gdriveClient.js";

dotenv.config();
export const fetchSampleFile = async (req, res) => {
  try {
    const { fileName, ext } = req.params;
    const drive = getDriveClient();

    // Search in SAMPLE FOLDER (case-insensitive)
    const response = await drive.files.list({
      q: `'${process.env.GDRIVE_SAMPLE_FOLDER_ID}' in parents and trashed=false and name contains '${fileName}'`,
      fields: "files(id, name, mimeType)",
    });

    if (!response.data.files.length) {
      return res.status(404).json({ message: "Sample file not found" });
    }

    const file = response.data.files.find(
      (f) => f.name.toLowerCase() === `${fileName}.${ext}`.toLowerCase()
    );

    if (!file) {
      return res.status(404).json({ message: "Sample file not found" });
    }

    // Stream file as binary so frontend ExcelJS can load
    const fileResponse = await drive.files.get(
      { fileId: file.id, alt: "media" },
      { responseType: "arraybuffer" }
    );

    res.setHeader("Content-Type", file.mimeType);
    res.send(Buffer.from(fileResponse.data));
  } catch (err) {
    console.error("Error fetching sample file:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch sample file", error: err.message });
  }
};

export const downloadSampleFile = async (req, res) => {
  try {
    const { fileName, ext } = req.params;
    const drive = getDriveClient();

    const response = await drive.files.list({
      q: `'${process.env.GDRIVE_SAMPLE_FOLDER_ID}' in parents and trashed=false and name contains '${fileName}'`,
      fields: "files(id, name, mimeType)",
    });

    if (!response.data.files.length) {
      return res.status(404).json({ message: "Sample file not found" });
    }

    const file = response.data.files.find(
      (f) => f.name.toLowerCase() === `${fileName}.${ext}`.toLowerCase()
    );

    if (!file) {
      return res.status(404).json({ message: "Sample file not found" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.setHeader("Content-Type", file.mimeType);

    const fileResponse = await drive.files.get(
      { fileId: file.id, alt: "media" },
      { responseType: "stream" }
    );

    fileResponse.data.pipe(res);
  } catch (err) {
    console.error("Error downloading sample file:", err);
    res
      .status(500)
      .json({ message: "Failed to download sample file", error: err.message });
  }
};
