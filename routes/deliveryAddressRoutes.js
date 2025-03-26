import express from "express";
import {
  addDeliveryAddress,
  fetchDeliveryAddresses,
} from "../controllers/deliveryAddressController.js";
import { authenticateToken } from "../middleware/User.js";

const router = express.Router();

router.post("/add", authenticateToken, addDeliveryAddress);
router.get("/deliveryAddress", authenticateToken, fetchDeliveryAddresses);

export default router;
