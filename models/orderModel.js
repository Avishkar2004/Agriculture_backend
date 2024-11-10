import { db } from "../config/db.js";

// Fetch orders by user ID
export const getOrdersByUserId = async (userId) => {
  try {
    const [orders] = await db.promise().execute(
      `SELECT 
        o.id, 
        o.product_id, 
        o.quantity, 
        o.product_name,
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
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};
