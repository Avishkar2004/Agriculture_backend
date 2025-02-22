import express from "express";
import { generateReview } from "../controllers/aiReviewController.js";

// This is called a Route level Middleware
const router = express.Router();

router.post("/generate-gemini-review", generateReview);

export default router;
