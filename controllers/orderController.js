import {
  cancelOrderById,
  createOrder,
  createOrderCheckOut,
  getOrdersByUserId,
  trackOrderById,
} from "../models/orderModel.js";

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

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id; // assuming `req.user` is populated after authentication (e.g., from JWT or session)
    const orders = await getOrdersByUserId(userId);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Place order from checkout
export async function placeOrderCheckOut(req, res) {
  try {
    const orderData = req.body;

    // Pass the complete order data to the model function
    await createOrderCheckOut(orderData);

    res.status(201).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Order placement failed:", error.message);
    res
      .status(500)
      .json({ message: "Failed to place order, please try again later." });
  }
}

// Track order
export const trackOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available from authentication middleware
    const { orderId } = req.params;

    // Fetch order details using the model
    const order = await trackOrderById(userId, orderId);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error tracking order:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel the order
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from authentication middleware
    const { orderId } = req.params;

    // Call the model function to cancel the order
    const result = await cancelOrderById(userId, orderId);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Order not found or already Cancelled",
        });
    }

    res
      .status(200)
      .json({ success: true, message: "Order Cancelled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel the order" });
  }
};
