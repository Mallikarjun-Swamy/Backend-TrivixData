import express from "express";
import {
  fetchSampleFile,
  downloadSampleFile,
} from "../controllers/sampleController.js";

const router = express.Router();

// GET sample as binary (for preview in table)
router.get("/:fileName.:ext", fetchSampleFile);

// GET sample for download
router.get("/:fileName.:ext/download", downloadSampleFile);

export default router;
