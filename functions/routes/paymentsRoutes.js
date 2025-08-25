import express from "express";
import {
  createOrder,
  captureOrder,
  checkPayment,
} from "../controllers/paymentsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// client -> create order (used by PayPal JS createOrder)
router.post("/create-order", authMiddleware, createOrder);

// client (onApprove) -> capture order
router.post("/capture-order", authMiddleware, captureOrder);

// client -> check existing payment status for file
router.post("/check", authMiddleware, checkPayment);

export default router;
