import { db } from "../config/db.js";

// Add a review
export const addReview = async (req, res) => {
  const { product_id, user_id, username, rating, comment } = req.body;
  // console.log("User Id", user_id);
  // console.log(req.body);

  if (
    !product_id ||
    !user_id ||
    !username ||
    !rating ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({
      error: "All fields are required and rating must be between 1 and 5",
    });
  }

  try {
    //! Check if the user has already reviewed the product
    const [existingReview] = await db
      .promise()
      .execute("SELECT * FROM reviews WHERE product_id = ? AND user_id  = ?", [
        product_id,
        user_id,
      ]);

    if (existingReview.length > 0) {
      return res.status(400).json({
        error:
          "You have already reviewed this product. You can update your review.",
      });
    }

    const [result] = await db.promise().execute(
      `INSERT INTO reviews (product_id, user_id, username, rating, comment) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         rating = VALUES(rating), 
         comment = VALUES(comment), 
         updated_at = NOW()`,
      [product_id, user_id, username, rating, comment]
    );

    res.status(201).json({
      message: "Review added successfully",
      reviewId: result.insertId || null, // If it updates, `insertId` may not be meaningful.
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch reviews for a product`
export const getReviewsByProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [reviews] = await db
      .promise()
      .execute("SELECT * FROM reviews WHERE product_id = ?", [id]);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateReview = async (req, res) => {
  const { product_id, user_id, rating, comment } = req.body;
  // Validate input
  if (!product_id || !user_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      error: "All fields are required and rating must be between 1 and 5",
    });
  }

  try {
    // Check if the review exists
    const [existingReview] = await db
      .promise()
      .execute("SELECT * FROM reviews WHERE product_id = ? AND user_id = ?", [
        product_id,
        user_id,
      ]);

    if (existingReview.length === 0) {
      return res.status(404).json({
        error: "Review not found. You need to add a review first.",
      });
    }

    // Update the review
    await db.promise().execute(
      `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE product_id = ? AND user_id = ?`,
      [rating, comment, product_id, user_id] // Parameters go in an array
    );

    res.status(200).json({
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a review by product id and user id
export const DeleteReview = async (req, res) => {
  const { product_id, user_id } = req.body;

  if (!product_id || !user_id) {
    return res
      .status(400)
      .json({ error: "Product ID and User ID are required." });
  }

  try {
    const [existingReview] = await db
      .promise()
      .execute("SELECT * FROM reviews WHERE product_id = ? AND user_id = ?", [
        product_id,
        user_id,
      ]);

    if (existingReview.length === 0) {
      return res.status(404).json({ error: "Review not found." });
    }

    // Delete the review
    await db
      .promise()
      .execute("DELETE FROM reviews WHERE product_id = ? AND user_id = ?", [
        product_id,
        user_id,
      ]);

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Like a review
export const likeReview = async (req, res) => {
  const { review_id, user_id } = req.body;

  if (!review_id || !user_id) {
    return res
      .status(400)
      .json({ error: "Review ID and User ID are required." });
  }

  try {
    // Check if the user has already liked or disliked the review
    const [existingFeedback] = await db
      .promise()
      .execute(
        "SELECT like_count, dislike_count FROM review_feedback WHERE review_id = ? AND user_id = ?",
        [review_id, user_id]
      );

    if (existingFeedback.length > 0) {
      const { like_count, dislike_count } = existingFeedback[0];

      if (like_count > 0) {
        // User has already liked it, so remove the like
        await db
          .promise()
          .execute(
            "UPDATE review_feedback SET like_count = 0 WHERE review_id = ? AND user_id = ?",
            [review_id, user_id]
          );
        return res.status(200).json({ message: "Like removed.", liked: false });
      } else {
        // User liked it, remove dislike (if any), and update like
        await db
          .promise()
          .execute(
            "UPDATE review_feedback SET like_count = 1, dislike_count = 0 WHERE review_id = ? AND user_id = ?",
            [review_id, user_id]
          );
        return res.status(200).json({ message: "Review liked.", liked: true });
      }
    } else {
      // Insert new feedback
      await db
        .promise()
        .execute(
          "INSERT INTO review_feedback (review_id, user_id, like_count) VALUES (?, ?, 1)",
          [review_id, user_id]
        );
      return res.status(200).json({ message: "Review liked.", liked: true });
    }
  } catch (error) {
    console.error("Error liking review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const dislikeReview = async (req, res) => {
  const { review_id, user_id } = req.body;

  if (!review_id || !user_id) {
    return res
      .status(400)
      .json({ error: "Review ID and User ID are required." });
  }

  try {
    // Check if the user has already liked or disliked the review
    const [existingFeedback] = await db
      .promise()
      .execute(
        "SELECT like_count, dislike_count FROM review_feedback WHERE review_id = ? AND user_id = ?",
        [review_id, user_id]
      );

    if (existingFeedback.length > 0) {
      const { like_count, dislike_count } = existingFeedback[0];

      if (dislike_count > 0) {
        // User has already disliked it, so remove the dislike
        await db
          .promise()
          .execute(
            "UPDATE review_feedback SET dislike_count = 0 WHERE review_id = ? AND user_id = ?",
            [review_id, user_id]
          );
        return res
          .status(200)
          .json({ message: "Dislike removed.", disliked: false });
      } else {
        // User disliked it, remove like (if any), and update dislike
        await db
          .promise()
          .execute(
            "UPDATE review_feedback SET dislike_count = 1, like_count = 0 WHERE review_id = ? AND user_id = ?",
            [review_id, user_id]
          );
        return res
          .status(200)
          .json({ message: "Review disliked.", disliked: true });
      }
    } else {
      // Insert new feedback
      await db
        .promise()
        .execute(
          "INSERT INTO review_feedback (review_id, user_id, dislike_count) VALUES (?, ?, 1)",
          [review_id, user_id]
        );
      return res
        .status(200)
        .json({ message: "Review disliked.", disliked: true });
    }
  } catch (error) {
    console.error("Error disliking review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};  

// Report a Review
export const reportReview = async (req, res) => {
  const { review_id, user_id } = req.body;

  if (!review_id || !user_id) {
    return res
      .status(400)
      .json({ error: "Review ID and User ID are required." });
  }

  try {
    const [existingFeedback] = await db
      .promise()
      .execute(
        "SELECT * FROM review_feedback WHERE review_id = ? AND user_id = ?",
        [review_id, user_id]
      );

    if (existingFeedback.length > 0) {
      await db
        .promise()
        .execute(
          "UPDATE review_feedback SET report_count = report_count + 1 WHERE review_id = ? AND user_id = ?",
          [review_id, user_id]
        );
    } else {
      await db
        .promise()
        .execute(
          "INSERT INTO review_feedback (review_id, user_id, report_count) VALUES (?, ?, 1)",
          [review_id, user_id]
        );
    }

    res.status(200).json({ message: "Review reported successfully." });
  } catch (error) {
    console.error("Error reporting review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Review Feedback Summary
export const getReviewFeedback = async (req, res) => {
  const { review_id } = req.params;

  if (!review_id) {
    return res.status(400).json({ error: "Review ID is required." });
  }

  try {
    const [feedback] = await db.promise().execute(
      `SELECT 
          rf.review_id, 
          r.user_id AS reviewer_id, 
          SUM(rf.like_count) AS total_likes, 
          SUM(rf.dislike_count) AS total_dislikes, 
          SUM(rf.report_count) AS total_reports
      FROM review_feedback rf
      JOIN reviews r ON rf.review_id = r.id
      WHERE rf.review_id = ?
      GROUP BY rf.review_id, r.user_id`,
      [review_id]
    );

    res
      .status(200)
      .json(
        feedback.length
          ? feedback[0]
          : { message: "No feedback found for this review." }
      );
  } catch (error) {
    console.error("Error fetching review feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
