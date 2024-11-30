import { db } from "../config/db.js";

export const searchProducts = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const queries = [
      db
        .promise()
        .execute("SELECT * FROM fungicides WHERE name LIKE ?", [`%${q}%`]),
      db
        .promise()
        .execute("SELECT * FROM plantgrowthregulator WHERE name LIKE ?", [
          `%${q}%`,
        ]),
      db
        .promise()
        .execute("SELECT * FROM organicproduct WHERE name LIKE ?", [`%${q}%`]),
      db
        .promise()
        .execute("SELECT * FROM micro_nutrients WHERE name LIKE ?", [`%${q}%`]),
      db
        .promise()
        .execute("SELECT * FROM insecticide WHERE name LIKE ?", [`%${q}%`]),
    ];

    const [
      fungicides,
      plantGrowthRegulators,
      organicProducts,
      microNutrients,
      insecticides,
    ] = await Promise.all(queries);

    const results = [
      ...fungicides[0],
      ...plantGrowthRegulators[0],
      ...organicProducts[0],
      ...microNutrients[0],
      ...insecticides[0],
    ];

    const productsWithBase64Images = results.map((product) => {
      const base64Image = Buffer.from(product.image, "binary").toString(
        "base64"
      );
      return { ...product, image: base64Image };
    });

    res.json(productsWithBase64Images);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


