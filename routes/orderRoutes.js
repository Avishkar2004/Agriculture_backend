import express from "express";
import {
  autoCompleteOrder,
  cancelOrder,
  generateInvoice,
  getOrders,
  placeOrder,
  placeOrderCheckOut,
  trackOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/User.js";
// import { getCehckoutOrdersByUserId } from "../models/orderModel.js";

const router = express.Router();

// Route for placing an order
router.post("/orders", authenticateToken, placeOrder);

// Route for placing checkout order
router.post("/checkoutOrder", authenticateToken, placeOrderCheckOut);

// Route to get user's orders
router.get("/placedorders", authenticateToken, getOrders);

//  Track order
router.get("/trackOrder/:orderId", authenticateToken, trackOrder);

router.put("/order-status/:orderId", authenticateToken, updateOrderStatus);

// Cancel the Order
router.patch("/cancelOrder/:orderId", authenticateToken, cancelOrder);

// Generate Invoice Route

router.get("/generateInvoice/:orderId", authenticateToken, generateInvoice);

export default router;
