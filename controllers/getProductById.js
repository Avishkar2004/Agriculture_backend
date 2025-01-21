import { db } from "../config/db.js";


//! This is for search
export const getProductById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const [result] = await db.promise().execute(
      "SELECT * FROM fungicides WHERE id = ? UNION " +
      "SELECT * FROM plantgrowthregulator WHERE id = ? UNION " +
      "SELECT * FROM organicproduct WHERE id = ? UNION " +
      "SELECT * FROM micro_nutrients WHERE id = ? UNION " +
      "SELECT * FROM insecticide WHERE id = ?",
      [id, id, id, id, id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = result[0];
    product.image = Buffer.from(product.image, "binary").toString("base64");

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};