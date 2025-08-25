import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createUser,
  deleteUser,
  fetchAllDownloads,
  fetchAllPayments,
  fetchAllUsers,
  updateUser,
} from "../controllers/adminController.js";

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });
  next();
};

// Admin creates verified user
router.post("/create-user", authMiddleware, isAdmin, createUser);
router.get("/users", authMiddleware, isAdmin, fetchAllUsers);
router.put("/update-user/:id", authMiddleware, isAdmin, updateUser);
router.delete("/delete-user/:id", authMiddleware, isAdmin, deleteUser);

//admin fetches all downlaods and Payments
router.get("/downloads", authMiddleware, isAdmin, fetchAllDownloads);
router.get("/payments", authMiddleware, isAdmin, fetchAllPayments);

export default router;
