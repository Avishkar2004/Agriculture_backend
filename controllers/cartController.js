import { db } from "../config/db.js";

export const getCartItems = (req, res) => {
  db.query("SELECT * FROM cart", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error in Cart" });
      return;
    }

    try {
      const baseWithCart = results.map((cart) => {
        const baseCartPhoto = cart.image
          ? Buffer.from(cart.image, "binary").toString("base64")
          : null;

        return { ...cart, image: baseCartPhoto };
      });

      res.send(baseWithCart);
    } catch (error) {
      console.error("Error processing cart data:", error);
      res.status(500).json({ error: "Internal server error in Cart" });
    }
  });
};

export const addToCart = (req, res) => {
  try {
    const newItem = req.body;
    console.log("Received request to add to cart:", newItem);

    // Convert base64 image to buffer
    const binaryImage = newItem.image
      ? Buffer.from(newItem.image, "base64")
      : null;

    const insertOrUpdateQuery = `INSERT INTO cart (id, name, price, image, quantity, productType)
          VALUES (?, ?, ?, ?, ?, ?)
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

  const deleteQuery = "DELETE FROM cart WHERE id = ?";
  db.query(deleteQuery, [itemId], (err, results) => {
    if (err) {
      console.error("Error deleting cart item:", err);
      return res.status(500).json({ error: "internal server error" });
    }
    if (res.affectedRows === 0) {
      return res.status(404).json({ error: "item not found in cart" });
    }
    res.json({ success: true, message: "Item removed from cart" });
  });
};
