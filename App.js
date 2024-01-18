import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import mysql2 from "mysql2";
import sharp from "sharp";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agrisite",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const app = express();
const port = 8080;

const outputFolder = "output";

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

class Products {
  constructor(name, description, salePrice, reviews, stockStatus, image, to) {
    this.id = null;
    this.name = name;
    this.description = description;
    this.salePrice = salePrice;
    this.reviews = reviews;
    this.stockStatus = stockStatus;
    this.image = image;
    this.to = to;
  }

  save(existingProducts) {
    this.id = String(uuidv4());
    existingProducts.push(this);
    fs.writeFile("data.json", JSON.stringify(existingProducts), (err) => {
      console.log(err);
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
}

const getProductsFromFile = (cb) => {
  fs.readFile("data.json", (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

fs.readdir("images", (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach((file) => {
    const formats = ["avif", "bin"];
    if (
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg") ||
      file.endsWith(".png") ||
      file.endsWith(".avif") ||
      file.endsWith(".jpg") ||
      file.endsWith(".webp")
    ) {
      const inputPath = `images/${file}`;
      const name = file.substring(0, file.lastIndexOf("."));

      formats.forEach((format) => {
        const outputPath = `output/${name}.${format}`;

        if (!fs.existsSync(outputPath)) {
          sharp(inputPath)
            .toFormat(format, { quality: 80 })
            .toFile(outputPath, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log(`${name}.${format} saved`);
              }
            });
        }
      });
    }
  });
});

const adminController = {
  getIndex: (req, res) => {
    res.send("Product Home Route");
  },

  getProducts: (req, res) => {
    Products.fetchAll((products) => {
      res.json(products);
    });
  },

  getProduct: (req, res) => {
    const productId = req.params.productId;
    Products.findById(productId, (product) => {
      res.json(product);
    });
  },

  postAddProduct: (req, res) => {
    const { name, description, salePrice, reviews, stockStatus, image, to } =
      req.body;
    const product = new Products(
      name,
      description,
      salePrice,
      reviews,
      stockStatus,
      image,
      to
    );
    product.save();
    res.json({ msg: "Product Added" });
  },
};

app.post("/users", async (req, res) => {
  try {
    // Extract user data from the request body
    const { username, email, password, confirmPassword } = req.body;

    // Hash the password and confirmPassword using bcrypt
    const hashedPassword = await bcrypt.hash(password, 20);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 20);

    // SQL query to insert user data into the database
    const insertUserQuery =
      "INSERT INTO users(username, email, password, confirmPassword) VALUES (?, ?, ?, ?)";

    // Execute the query using promises
    await db
      .promise()
      .execute(insertUserQuery, [
        username,
        email,
        hashedPassword,
        hashedConfirmPassword,
      ]);

    // Respond with a success message
    res.status(201).send("User registered successfully.");
  } catch (error) {
    // Log any errors and respond with an internal server error
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const selectUserQuery = "SELECT * FROM users WHERE username = ?";
    const [rows] = await db.promise().execute(selectUserQuery, [username]);

    if (rows.length === 0) {
      return res.status(401).send("Invalid username and password");
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid username and password");
    }

    const token = jwt.sign({ userId: user.id }, "your_secret_key", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
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
    res.json(productWithBase64Images);
  });
});

// This is for plant Growth Regulator
app.get("/plantgrowthregulator", (req, res) => {
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
});

// This is for Organic Product
app.get("/organicproduct", (req, res) => {
  db.query("SELECT * FROM organicproduct", (err, result) => {
    if (err) {
      console.err(err);
      res
        .status(500)
        .json({ error: "Internal server error in Organicproduct" });
      return;
    }

    const baseWithBase64Organic = result.map((organicproduct) => {
      const base64Organic = Buffer.from(
        organicproduct.image,
        "binary"
      ).toString("base64");
      return { ...organicproduct, image: base64Organic };
    });

    res.send(baseWithBase64Organic);
  });
});

// This is for Micro Nutrient
app.get("/micro-nutrients", (req, res) => {
  db.query("SELECT * FROM `micro-nutrients`", (err, results) => {
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

    res.send(baseWithBase64micronutrients);
  });
});

// This is for Insecticide
app.get("/Insecticide", (req, res) => {
  db.query("SELECT * FROM Insecticide", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server error in Insecticide" });
      return;
    }
    const baseWithBase64Insecticide = results.map((Insecticide) => {
      const base64ImageInsecticide = Buffer.from(
        Insecticide.image, // Corrected property name
        "binary"
      ).toString("base64");
      return { ...Insecticide, image: base64ImageInsecticide };
    });

    res.send(baseWithBase64Insecticide);
  });
});

// This is for cart
app.get("/cart", (req, res) => {
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
});

// For inserting data

app.post("/cart", (req, res) => {
  try {
    const newItem = req.body;
    console.log("Received request to add to cart:", newItem);

    // Convert base64 image to buffer
    const binaryImage = newItem.image
      ? Buffer.from(newItem.image, "base64")
      : null;

    const insertOrUpdateQuery = `
      INSERT INTO cart (id, name, price, image)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      price = VALUES(price),
      image = VALUES(image)
    `;

    db.query(
      insertOrUpdateQuery,
      [newItem.id, newItem.name, newItem.price, binaryImage],
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
});

const adminRoute = express.Router();

adminRoute.get("/", adminController.getIndex);
adminRoute.get("/products", adminController.getProducts);
adminRoute.get("/products/:productId", adminController.getProduct);
adminRoute.post("/add-product", adminController.postAddProduct);

app.use("/", adminRoute);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () =>
  console.log(`Server running on port ${port}, http://localhost:${port}`)
);
