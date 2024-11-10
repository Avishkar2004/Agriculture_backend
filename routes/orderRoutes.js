import express from "express";
import { getOrders, placeOrder } from "../controllers/orderController.js";
import { authenticateToken} from "../middleware/User.js"

const router = express.Router();

// Route for placing an order
router.post("/orders", placeOrder);

// Route to get user's orders
router.get("/placedorders",authenticateToken ,getOrders);


export default router;
