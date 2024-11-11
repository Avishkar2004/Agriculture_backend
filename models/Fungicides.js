import { db } from "../config/db.js";

export const Fungicides = (req, res) => {
  db.query("SELECT * FROM fungicides", (err, result) => {
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
    // Send the response after 2 seconds
    setTimeout(() => {
      res.json(productWithBase64Images);
    }, 2000);
  });
};
