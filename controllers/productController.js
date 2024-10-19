import { db } from "../config/db.js";

export const getNextProductplantgrowthregulator = (req, res) => {
  const currentId = parseInt(req.params.id, 10); // Get current product ID from request params

  db.query(
    "SELECT * FROM plantgrowthregulator WHERE id > ? ORDER BY id ASC LIMIT 1",
    [currentId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ message: "No more products available" });
      } else {
        // Send back the next product
        const productWithBase64PGRImage = {
          ...results[0],
          image: Buffer.from(results[0].image, "binary").toString("base64"),
        };
        res.json(productWithBase64PGRImage);
      }
    }
  );
};

export const getNextProductorganicproduct = (req, res) => {
  const currentId = parseInt(req.params.id, 10);
  db.query(
    "SELECT * FROM `organicproduct` WHERE id > ? ORDER BY id ASC LIMIT 1",
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
      } else {
        const productWithBase64PGRImage = {
          ...results[0],
          image: Buffer.from(results[0].image, "binary").toString("base64"),
        };
        res.json(productWithBase64PGRImage);
      }
    }
  );
};

export const getNextProductmicro_nutrients = (req, res) => {
  const currentId = parseInt(req.params.id, 10); //Get current prodcut ID from request Params
  db.query(
    "SELECT * FROM `micro_nutrients` WHERE id > ? ORDER BY id ASC LIMIT 1",
    [currentId],
    (err, results) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Internal Server error in fetching next product" });
        return;
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "No next product found" });
      } else {
        const productWithBase64PGRImage = {
          ...results[0],
          image: Buffer.from(results[0].image, "binary").toString("base64"),
        };
        res.json(productWithBase64PGRImage);
      }
    }
  );
};

export const getNextProductinsecticide = (req, res) => {
  const currentId = parseInt(req.params.id, 10);
  db.query(
    "SELECT * FROM `insecticide` WHERE id > ? ORDER BY id ASC LIMIT 1",
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
      } else {
        const productWithBase64PGRImage = {
          ...results[0],
          image: Buffer.from(results[0].image, "binary").toString("base64"),
        };
        res.json(productWithBase64PGRImage);
      }
    }
  );
};

export const getNextProductfungicides = (req, res) => {
  const currentId = parseInt(req.params.id);
  db.query(
    "SELECT * FROM `fungicides` WHERE id > ? ORDER BY id ASC LIMIT 1",
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
      } else {
        const productWithBase64PGRImage = {
          ...results[0],
          image: Buffer.from(results[0].image, "binary").toString("base64"),
        };
        res.json(productWithBase64PGRImage);
      }
    }
  );
};
