import { db } from "../config/db.js";

export const getOrganicProducts = (req, res) => {
  db.query("SELECT * FROM organicproduct", (err, result) => {
    if (err) {
      console.error(err); // Corrected from `console.err` to `console.error`
      return res
        .status(500)
        .json({ error: "Internal server error in Organicproduct" });
    }

    try {
      // Map the results to convert image to base64
      const baseWithBase64Organic = result.map((organicproduct) => {
        const base64Organic = Buffer.from(
          organicproduct.image,
          "binary"
        ).toString("base64");
        return { ...organicproduct, image: base64Organic };
      });

      // Send the response
      res.status(200).json(baseWithBase64Organic);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error during image conversion" });
    }
  });
};
