import express from "express";
import {
  getOrders,
  placeOrder,
  placeOrderCheckOut,
} from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/User.js";
// import { getCehckoutOrdersByUserId } from "../models/orderModel.js";

const router = express.Router();

// Route for placing an order
router.post("/orders", placeOrder);

// Route for placing checkout order
router.post("/checkoutOrder", placeOrderCheckOut);

// Route to get user's orders
router.get("/placedorders", authenticateToken, getOrders);

// router.get("/checkoutOrders", getCehckoutOrdersByUserId)

export default router;
