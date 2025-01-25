import express from "express";
import {
  cancelOrder,
  generateInvoice,
  getOrders,
  placeOrder,
  placeOrderCheckOut,
  trackOrder,
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

//  Track order
router.get("/trackOrder/:orderId", authenticateToken, trackOrder);

// Cancel the Order
router.patch("/cancelOrder/:orderId", authenticateToken, cancelOrder);

// Generate Invoice Route

router.get("/generateInvoice/:orderId", authenticateToken, generateInvoice);

export default router;
