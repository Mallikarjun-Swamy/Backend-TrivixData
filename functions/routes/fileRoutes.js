import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllFiles,
  uploadFileToDrive,
  updateFileData,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Admin check middleware
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });
  next();
};

// Routes
router.post(
  "/upload",
  authMiddleware,
  isAdmin,
  upload.single("file"),
  uploadFileToDrive
);

router.get("/", authMiddleware, isAdmin, getAllFiles);
router.put("/:id", authMiddleware, isAdmin, updateFileData);
router.delete("/:id/:gid", authMiddleware, isAdmin, deleteFile);

export default router;
