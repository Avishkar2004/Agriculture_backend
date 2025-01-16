import os from "os";
import cluster from "node:cluster";
import cors from "cors";
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import compression from "compression";
import { db } from "./config/db.js";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
import { authenticateToken } from "./middleware/User.js";
import { getOrganicProducts } from "./models/organicproduct.js";
import {
  loginHandler,
  logout,
  signupHandler,
  ForGetPassWord,
  resetPasswordHandler,
} from "./controllers/authController.js";
import passport from "./config/passport.js";
import githubPassport from "./config/passportGithub.js";

import authRouters from "./routes/auth.js";

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
import deliveryAddressRoutes from "./routes/deliveryAddressRoutes.js";
import reviewRouter from "./routes/reviewRouter.js";

import { getProductById } from "./controllers/getProductById.js";
import cacheMiddleware from "./middleware/cacheMiddleware.js";

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
  const server = http.createServer(app); //! Create an HTTP server using express

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Update to the React clie nt URL
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
      allowedHeaders: true,
    },
  });

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true, // Helps prevent XSS attacks
        sameSite: "lax", // Helps prevent CSRF attacks
      },
    })
  );

  // Initialize passport for google
  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize passport for github
  app.use(githubPassport.initialize());
  app.use(githubPassport.session());

  app.use(compression());
  app.use(cookieParser()); // Use cookie parser middleware

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  io.on("connection", (socket) => {
    console.log("New client connected");

    // Join a room
    socket.on("joinRoom", ({ username, room }) => {
      console.log(`${username} joined room: ${room}`);
      socket.username = username;
      socket.join(room);

      // Broadcast to the room that a user has joined
      io.to(room).emit("server-message", {
        text: `${username} has joined the room.`,
      });
    });

    // Handle messages sent to the room
    socket.on("chatMessage", (data) => {
      console.log("Message received:", data);
      io.to(data.room).emit("message", data);
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
  // Endpoint for handling user signup/createAcc
  app.post("/users", signupHandler);

  // Endpoint for handling google auth and github authentication
  app.use("/auth", authRouters);

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

  //!  Get Product by ID via search then render on next page
  app.get("/api/product/:id", getProductById);

  // This is for plant Growth Regulator
  app.get("/plantgrowthregulator", cacheMiddleware, plantgrowthregulator);

  // This is for Organic Product
  app.get("/organicproduct", cacheMiddleware, getOrganicProducts);

  // This is for Micro Nutrient
  app.get("/micro-nutrients", cacheMiddleware, micronutrient);

  // This is for Insecticide
  app.get("/Insecticide", cacheMiddleware, Insecticide);

  // for fetching product data (Fungicides)
  app.get("/fungicides", cacheMiddleware, Fungicides);

  // For Review's
  app.use("/api/reviews", reviewRouter);

  //! For order/ placedOrders info
  app.use("/api", authenticateToken, orderRoutes);

  app.use("/api/delivery-address", deliveryAddressRoutes);
  app.use("/api", deliveryAddressRoutes);

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

    server.listen(process.env.PORT || 8000, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  });
}
