import express from "express";
import {
  addDeliveryAddress,
  fetchDeliveryAddresses,
} from "../controllers/deliveryAddressController.js"; // Use ES module import syntax

const router = express.Router();

router.post("/add", addDeliveryAddress);
router.get("/deliveryAddress", fetchDeliveryAddresses);

export default router; // Use ES module export
