import express from "express";
import {
  addReview,
  DeleteReview,
  getReviewsByProduct,
  updateReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/addreviews", addReview);

router.get("/getreview/:id", getReviewsByProduct);

//! New router for Update reviews

router.put("/updateReview", updateReview);

router.delete("/deleteReview", DeleteReview);

export default router;
