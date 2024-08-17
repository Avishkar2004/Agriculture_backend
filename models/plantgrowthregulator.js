import { db } from "../config/db.js";

export const plantgrowthregulator = (req, res) => {
  db.query("SELECT * FROM plantgrowthregulator", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const productWithBase64PGRImages = result.map((plantgrowthregulator) => {
      const base64PGRImage = Buffer.from(
        plantgrowthregulator.image,
        "binary"
      ).toString("base64");
      return {
        ...plantgrowthregulator,
        image: base64PGRImage,
      };
    });
    res.json(productWithBase64PGRImages);
  });
};
