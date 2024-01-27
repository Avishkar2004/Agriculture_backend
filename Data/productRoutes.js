// productRoutes.js
import express from "express";
import { db } from "../db.js"; // Import your database module

export const router = express.Router(); // Export router as a named export

// Route for fetching product data (fungicides)
router.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const productWithBase64Images = result.map((product) => {
      const base64Image = Buffer.from(product.image, "binary").toString(
        "base64"
      );
      return { ...product, image: base64Image };
    });

    res.json(productWithBase64Images);
  });
});
