import os from "os";
import cluster from "node:cluster";
import cors from "cors";
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser"; // Add this to parse cookies
import compression from "compression";
import { db } from "./config/db.js";

import { authenticateToken } from "./middleware/User.js";
import { getOrganicProducts } from "./models/organicproduct.js";
import {
  loginHandler,
  logout,
  signupHandler,
  ForGetPassWord,
  resetPasswordHandler,
} from "./controllers/authController.js";
import { plantgrowthregulator } from "./models/plantgrowthregulator.js";
import { micronutrient } from "./models/micronutrients.js";
import { Insecticide } from "./models/Insecticide.js";
import { Fungicides } from "./models/Fungicides.js";
import {
  getNextProductfungicides,
  getNextProductinsecticide,
  getNextProductmicro_nutrients,
  getNextProductorganicproduct,
  getNextProductplantgrowthregulator,
} from "./controllers/productController.js";
import {
  addToCart,
  deleteFromCart,
  getCartItems,
} from "./controllers/cartController.js";
import { searchProducts } from "./controllers/searchController.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // Ensure correct import

const numCPUs = os.cpus().length; //get the number of available CPU Cores
// console.log(numCPUs)

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (Worker, code, signal) => {
    console.log(`Worker ${Worker.process.pid} died. Starting new one...`);
    cluster.fork();
  });
} else {
  //Worker Can Share any TCp connection, like the one for Express
  const app = express();
  app.use(compression());
  app.use(cookieParser()); // Use cookie parser middleware
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Endpoint for handling user signup/createAcc
  app.post("/users", signupHandler);

  app.post("/login", loginHandler);

  app.post("/logout", logout);

  //! Delete User by Id
  app.use("/api", userRoutes); // This line is correct

  // this is for reset password
  app.post("/resetpassword", resetPasswordHandler);

  //this is for sending opt
  app.post("/forgotpassword", ForGetPassWord);

  //! For Search :-
  app.get("/search", searchProducts);

  // This is for plant Growth Regulator
  app.get("/plantgrowthregulator", plantgrowthregulator);

  // This is for Organic Product
  app.get("/organicproduct", getOrganicProducts);

  // This is for Micro Nutrient
  app.get("/micro-nutrients", micronutrient);

  // This is for Insecticide
  app.get("/Insecticide", Insecticide);

  // for fetching product data (Fungicides)
  app.get("/products", Fungicides);

  //! For order/ placedOrders info
  app.use("/api", authenticateToken, orderRoutes);

  app.get("/plantgrowthregulator/next/:id", getNextProductplantgrowthregulator);
  app.get("/organicproduct/next/:id", getNextProductorganicproduct);
  app.get("/micro_nutrients/next/:id", getNextProductmicro_nutrients);
  app.get("/insecticide/next/:id", getNextProductinsecticide);
  app.get("/fungicides/next/:id", getNextProductfungicides);

  // For showing products info in cart
  app.get("/cart", authenticateToken, getCartItems);

  // For inserting data (Protected route)
  app.post("/cart", authenticateToken, addToCart);

  app.delete("/cart/:id", authenticateToken, deleteFromCart);

  app.get("/", (req, res) => {
    res.send("Hello world");
  });

  db.connect((err) => {
    if (err) {
      console.error("Error connecting to Database: ", err);
      return; //Exit if connection fails
    }

    app.listen(process.env.PORT || 8000, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  });
}
