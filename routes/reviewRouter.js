import express from "express";
import {
  addReview,
  getReviewsByProduct,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/addreviews", addReview);

router.get("/getreview/:id", getReviewsByProduct);

export default router;
