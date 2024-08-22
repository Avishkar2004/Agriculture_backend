import cors from "cors";
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser"; // Add this to parse cookies
import "dotenv/config";
import { authenticateToken } from "./middleware/User.js";
import { getOrganicProducts } from "./models/organicproduct.js";
import {
  loginHandler,
  logout,
  userHandler,
  ForGetPassWord,
  resetPasswordHandler,
} from "./controllers/authController.js";
import { plantgrowthregulator } from "./models/plantgrowthregulator.js";
import { micronutrient } from "./models/micronutrients.js";
import { Insecticide } from "./models/Insecticide.js";
import { Fungicides } from "./models/Fungicides.js";
import { getNextProduct } from "./controllers/productController.js";
import {
  addToCart,
  deleteFromCart,
  getCartItems,
} from "./controllers/cartController.js";
import { searchProducts } from "./controllers/searchController.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Use cookie parser middleware


// Endpoint for handling user signup/createAcc
app.post("/users", userHandler);

app.post("/login", loginHandler);

app.post("/logout", logout);

// this is for reset password
app.post("/resetpassword", resetPasswordHandler);

//this is for sending opt
app.post("/forgotpassword", ForGetPassWord);

//! For Search :-

app.get("/search", searchProducts);

// for fetching product data (Fungicides )
app.get("/products", Fungicides);

// This is for plant Growth Regulator
app.get("/plantgrowthregulator", plantgrowthregulator);

// This is for Organic Product
app.get("/organicproduct", getOrganicProducts);

// This is for Micro Nutrient
app.get("/micro-nutrients", micronutrient);

app.get("/products/next/:id", getNextProduct);

// This is for Insecticide
app.get("/Insecticide", Insecticide);

app.get("/cart",authenticateToken, getCartItems);

// For inserting data (Protected route)
app.post("/cart", authenticateToken, addToCart);

app.delete("/cart/:id",authenticateToken, deleteFromCart);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT || 8000, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
