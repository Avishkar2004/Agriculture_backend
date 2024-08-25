import { db } from "../config/db.js";

export const getNextProductmicro_nutrients = (req, res) => {
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
      nextProduct.image = Buffer.from(nextProduct.image, "binary").toString(
        "base64"
      );
      res.json(nextProduct);
    }
  );
};

export const getNextProductplantgrowthregulator = (req, res) => {
  const currentId = parseInt(req.params.id);
  db.query(
    "SELECT * FROM `plantgrowthregulator` WHERE id > ? ORDER BY id ASC LIMIT 1",
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
      nextProduct.image = Buffer.from(nextProduct.image, "binary").toString(
        "base64"
      );
      res.json(nextProduct);
    }
  );
};

export const getNextProductorganicproduct = (req, res) => {
  const currentId = parseInt(req.params.id);
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
      }

      const nextProduct = results[0];
      nextProduct.image = Buffer.from(nextProduct.image, "binary").toString(
        "base64"
      );
      res.json(nextProduct);
    }
  );
};

export const getNextProductinsecticide = (req, res) => {
  const currentId = parseInt(req.params.id);
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
      }

      const nextProduct = results[0];
      nextProduct.image = Buffer.from(nextProduct.image, "binary").toString(
        "base64"
      );
      res.json(nextProduct);
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
      }

      const nextProduct = results[0];
      nextProduct.image = Buffer.from(nextProduct.image, "binary").toString(
        "base64"
      );
      res.json(nextProduct);
    }
  );
};