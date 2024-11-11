import { db } from "../config/db.js";

export const micronutrient = (req, res) => {
  db.query("SELECT * FROM `micro_nutrients`", (err, results) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Internal Server error in micro-nutrients" });
      return;
    }

    const baseWithBase64micronutrients = results.map((micronutrient) => {
      const base64Image = Buffer.from(
        micronutrient.image, // Corrected property name
        "binary"
      ).toString("base64");
      return { ...micronutrient, image: base64Image };
    });
    // Send the response after 2 seconds
    setTimeout(() => {
      res.send(baseWithBase64micronutrients);
    }, 2000);
  });
};
