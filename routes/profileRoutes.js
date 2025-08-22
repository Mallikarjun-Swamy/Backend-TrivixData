import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getUserDownloads,
  getUserPayments,
  deleteAccount,
  updateUser,
  getAllFilesForUser,
} from "../controllers/profileController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/downloads", getUserDownloads);
router.get("/payments", getUserPayments);
router.get("/allfiles", getAllFilesForUser);
router.delete("/delete", deleteAccount);
router.put("/update", updateUser);

export default router;
