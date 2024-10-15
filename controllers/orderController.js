import { createOrder } from "../models/orderModel.js";

export async function placeOrder(req, res) {
  try {
    const orderData = req.body;

    // Call the createOrder function from the model
    const orderId = await createOrder(orderData);

    // Return a success response
    res.status(201).json({ message: "Order placed successfully!", orderId });
  } catch (error) {
    console.error("Order placement failed:", error.message);

    // Return an error response with proper status code
    res
      .status(500)
      .json({ message: "Failed to place order, please try again later." });
  }
}
