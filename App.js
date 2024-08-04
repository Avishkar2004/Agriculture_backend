import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import "dotenv/config";
import cookieParser from "cookie-parser"; // Add this to parse cookies
import "dotenv/config";
const app = express();

import { resetPasswordHandler } from "./PasswordManager/resetPassword.js";
import { userHandler } from "./Users/signup.js";
import { db } from "./db.js";
import { authenticateToken } from "./middleware/User.js";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Use cookie parser middleware

const transporter = nodemailer.createTransport({
  service: "gmail",
  user: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    user: "avishkarkakde2004@gmail.com",
    pass: "axgu dwwt simr twfe",
  },
});

//this is for sending opt
app.post("/forgotpassword", async (req, res) => {
  try {
    const { email } = req.body;

    // Server-side email format validation
    if (!email || !email.includes("@gmail.com")) {
      return res.status(400).send("Please provide a valid Gmail address.");
    }

    // Check if the email exists in the database
    const [user] = await db
      .promise()
      .execute("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
      return res.status(404).json({ error: "Invalid email." });
    }

    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save the OTP in the database
    await db
      .promise()
      .execute("UPDATE users SET otp = ? WHERE email = ?", [otp, email]);

    // Compose email message and send it
    const mailOptions = {
      from: "kakdevicky476@gmail.com",
      to: email,
      subject: "Forgot Password OTP",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP via email:", error);
        return res.status(500).json({ error: "Error sending OTP via email." });
      }
      res
        .status(200)
        .json({ success: true, message: "OTP sent successfully." });
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// this is for reset password
app.post("/resetpassword", resetPasswordHandler);

//! For Search :-

app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const queries = [
      db
        .promise()
        .execute("SELECT * FROM products WHERE name LIKE ?", [`%${q}%`]),
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
      products,
      plantGrowthRegulators,
      organicProducts,
      microNutrients,
      insecticides,
    ] = await Promise.all(queries);

    const results = [
      ...products[0],
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
});

// Endpoint for handling user signup/createAcc
app.post("/users", userHandler);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the username exists in the database
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length === 0 || existingUser[0].password !== password) {
      return res
        .status(401)
        .json({ error: "Both username and password are wrong." });
    }

    // Generate a random secret key
    const secretKey = process.env.SECRET_KEY; // Ensure you have this in your .env file
    const user = { id: existingUser[0].id, username, password };
    const token = jwt.sign(user, secretKey);

    res.cookie("authToken", token, { httpOnly: true, sameSite: "strict" });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// for fetching product data (Fungicides )
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

    res.send(baseWithBase64micronutrients);
  });
});

app.get("/products/next/:id", (req, res) => {
  const currentId = parseInt(req.params.id);
  db.query(
    "SELECT * FROM `micro_nutrients` WHERE id > ? ORDER BY id ASC LIMIT 1",
    [currentId],
    (err, results) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Internal Server errorr in fetching next product" });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ error: "No next product found" });
        return;
      }

      const nextProduct = results[0];
      nextProduct.image = Buffer.from(nextProduct.image, "binary").toString(
        "base64"
      );
      res.json(nextProduct);
    }
  );
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

// This is for cart(cart api)
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

// For inserting data (Protected route)
app.post("/cart", authenticateToken, (req, res) => {
  try {
    const newItem = req.body;
    console.log("Received request to add to cart:", newItem);

    // Convert base64 image to buffer
    const binaryImage = newItem.image
      ? Buffer.from(newItem.image, "base64")
      : null;

    const insertOrUpdateQuery = `
        INSERT INTO cart (id, name, price, image, quantity)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        price = VALUES(price),
        image = VALUES(image),
        quantity = VALUES(quantity)
        `;
    db.query(
      insertOrUpdateQuery,
      [newItem.id, newItem.name, newItem.price, binaryImage, newItem.quantity],
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

app.delete("/cart/:id", (req, res) => {
  const itemId = req.params.id;

  const deleteQuery = "DELETE FROM cart WHERE id = ?";
  db.query(deleteQuery, [itemId], (err, results) => {
    if (err) {
      console.error("Error deleting cart item:", err);
      return res.status(500).json({ error: "internal server error" });
    }
    if (res.affectedRows === 0) {
      return res.status(404).json({ error: "item not found in cart" });
    }
    res.json({ success: true, message: "Item removed from cart" });
  });
});

const adminRoute = express.Router();

app.use("/", adminRoute);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
