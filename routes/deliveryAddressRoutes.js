import express from "express";
import { addDeliveryAddress } from "../controllers/deliveryAddressController.js"; // Use ES module import syntax

const router = express.Router();

router.post("/add", addDeliveryAddress);

export default router; // Use ES module export
