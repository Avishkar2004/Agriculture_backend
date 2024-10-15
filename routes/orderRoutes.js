import express from 'express';
import { placeOrder } from '../controllers/orderController.js';

const router = express.Router();

// Route for placing an order
router.post('/orders', placeOrder);

export default router;
