import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import mysql2 from "mysql2";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agrisite",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
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

// Endpoint for handling user signup/createAcc
app.post("/users", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  console.log("Request Body:", req.body); // Log the entire request body
  try {
    // check if the username already exists
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUser.length > 0) {
      // If username already exists, return a message and prompt user to choose another
      return res
        .status(400)
        .json({ message: "Username is already taken. Please choose another." });
    }

    // if the username is not taken, proceed with the insertion
    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO users (username, email, password, confirmpassword) VALUES (?, ?, ?, ?)",
        [username, email, password, confirmPassword]
      );

    const user = { id: result.insertId, username, password }; // Assuming your result object has an insertId property
    // Generate a random secret key
    const secretKey = crypto.randomBytes(32).toString("hex");
    console.log("Secret Key:", secretKey);

    // If the insertion is successful, return a success message along with user details

    const token = jwt.sign(user, secretKey, { expiresIn: "10days" }); // Set expiration time
    res.cookie("authToken", token, { httpOnly: true, sameSite: "strict" });
    // Do not include the password in the response
    // delete user.password;
    res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      secretKey,
      token,
    });
    console.log(result);
  } catch (error) {
    console.error("Error inserting user into database/ Failed to Sign in:", error);
    res.status(500).send("Internal Server Error");
  }
});

//fetch data from login
// Your server-side code
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the username exists in the database
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length === 0 || existingUser[0].password !== password) {
      // both cases are treated the same  wat to provide a generic error message
      return res
        .status(401)
        .json({ error: "Both username and password are wrong." });
    }
    if (existingUser.length === 0) {
      return res.status(401).json({ error: "Username not found." });
    }
    // Check if the provided password matches the stored password
    if (existingUser[0].password !== password) {
      return res.status(401).json({
        error:
          "Sorry, your password was incorrect. Please double-check your password.",
      });
    }

    // Generate a random secret key
    const secretKey = crypto.randomBytes(32).toString("hex");
    console.log("Secret Key:", secretKey);

    // If username and password are correct, you can consider the user logged in
    const user = { id: existingUser[0].id, username, password };
    const token = jwt.sign(user, secretKey);

    res.cookie("authToken", token, { httpOnly: true, sameSite: "strict" });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      secretKey,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// for fetching product data
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
