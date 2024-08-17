import { db } from "../config/db.js";

export const getNextProduct = (req, res) => {
  const currentId = parseInt(req.params.id);
  db.query(
    "SELECT * FROM `micro_nutrients` WHERE id > ? ORDER BY id ASC LIMIT 1",
    [currentId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Internal Server error in fetching next product" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "No next product found" });
      }

      const nextProduct = results[0];
      nextProduct.image = Buffer.from(nextProduct.image, "binary").toString("base64");
      res.json(nextProduct);
    }
  );
};
