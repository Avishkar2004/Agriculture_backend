import express from "express";
import {
  likeReview,
  dislikeReview,
  reportReview,
  getReviewFeedback,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/like", likeReview);
router.post("/dislike", dislikeReview);
router.post("/report", reportReview);
router.get("/:review_id", getReviewFeedback);

export default router;
