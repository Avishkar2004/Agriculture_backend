import { createOrder } from "../models/orderModel.js";
import { db } from "../config/db.js";

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
  console.log(req.user); // Log req.user to check if it's properly populated
  const userId = req.user.id; // assuming you have user data from JWT or session
  try {
    const [orders] = await db
      .promise()
      .execute(
        `SELECT 
           o.id, 
           o.product_id, 
           o.quantity, 
           o.customer_name, 
           o.email, 
           o.phone_number, 
           o.address, 
           o.city, 
           o.state, 
           o.zip_code, 
           o.country, 
           o.payment_method, 
           o.credit_card, 
           o.upi_id, 
           o.bank_name, 
           o.order_status, 
           o.created_at
         FROM orders o
         WHERE o.user_id = ?`,
        [userId]
      );

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
