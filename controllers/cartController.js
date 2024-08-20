import { db } from "../config/db.js";

export const getCartItems = (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT payload

  db.query("SELECT * FROM cart WHERE user_id = ?", [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error in Cart" });
    }

    try {
      const baseWithCart = results.map((cart) => {
        const baseCartPhoto = cart.image
          ? Buffer.from(cart.image, "binary").toString("base64")
          : null;

        return { ...cart, image: baseCartPhoto };
      });

      res.json(baseWithCart);
    } catch (error) {
      console.error("Error processing cart data:", error);
      res.status(500).json({ error: "Internal server error in Cart" });
    }
  });
};

export const addToCart = (req, res) => {
  try {
    const newItem = req.body;
    const userId = req.user.id; // Extract user ID from JWT payload

    const binaryImage = newItem.image
      ? Buffer.from(newItem.image, "base64")
      : null;

    const insertOrUpdateQuery = `
      INSERT INTO cart (id, name, price, image, quantity, productType, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        price = VALUES(price),
        image = VALUES(image),
        quantity = VALUES(quantity),
        productType = VALUES(productType)
    `;
    db.query(
      insertOrUpdateQuery,
      [
        newItem.id,
        newItem.name,
        newItem.price,
        binaryImage,
        newItem.quantity,
        newItem.productType,
        userId, // Pass user_id to the query
      ],
      (err, results) => {
        if (err) {
          console.error("Error inserting or updating cart item:", err);
          return res
            .status(500)
            .json({ error: "Internal server error in Cart" });
        }
        res.json({ ...newItem });
      }
    );
  } catch (error) {
    console.error("Unexpected error in /cart route:", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
};

export const deleteFromCart = (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id; // Extract user ID from JWT payload

  const deleteQuery = "DELETE FROM cart WHERE id = ? AND user_id = ?";
  db.query(deleteQuery, [itemId, userId], (err, results) => {
    if (err) {
      console.error("Error deleting cart item:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    res.json({ success: true, message: "Item removed from cart" });
  });
};
