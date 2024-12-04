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
