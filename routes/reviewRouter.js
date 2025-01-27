import express from "express";
import {
  addReview,
  DeleteReview,
  getReviewsByProduct,
  updateReview,
} from "../controllers/reviewController.js";

const router = express.Router();

//! Add reviews
router.post("/addreviews", addReview);
//! get reviews
router.get("/getreview/:id", getReviewsByProduct);

//! New router for Update and delete reviews
router.put("/updateReview", updateReview);

router.delete("/deleteReview", DeleteReview);

export default router;
