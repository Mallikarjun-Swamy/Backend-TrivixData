import express from "express";
import { submitContactForm } from "../controllers/contactController.js";

const router = express.Router();

router.post("/send-email", submitContactForm);

export default router;
