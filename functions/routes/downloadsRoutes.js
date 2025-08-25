// server/routes/downloadRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  downloadFile,
  checkDownloadToken,
  downloadAgain,
} from "../controllers/downloadsController.js";

const router = express.Router();

// GET /api/user/download/:token -> stream the file
router.get("/:token", authMiddleware, downloadFile);

// POST /api/user/download/check -> check token & get file metadata
router.post("/check", authMiddleware, checkDownloadToken);

// POST /api/user/download/request -> issue temporary download token after payment check
router.post("/again", authMiddleware, downloadAgain);

export default router;
