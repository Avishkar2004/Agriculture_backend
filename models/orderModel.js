import { db } from "../config/db.js";

export async function createOrder(orderData) {
  const query = `
    INSERT INTO orders (
      product_name,
      product_id,
      user_id,
      quantity,
      customer_name,
      email,
      phone_number,
      address,
      city,
      state,
      zip_code,
      country,
      payment_method,
      credit_card,
      upi_id,
      bank_name,
      order_status,
      price
    ) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `;

  const values = [
    orderData.productName,
    orderData.product_id,
    orderData.user_id,
    orderData.quantity,
    orderData.customerName,
    orderData.email,
    orderData.phoneNumber,
    orderData.address,
    orderData.city,
    orderData.state,
    orderData.zipCode,
    orderData.country,
    orderData.paymentMethod,
    orderData.creditCard || null,
    orderData.upiId || null,
    orderData.bankName || null,
    orderData.price,
  ];

  try {
    // Use a Promise wrapper to handle async behavior for `db.query()`
    const result = await new Promise((resolve, reject) => {
      db.query(query, values, (error, results) => {
        if (error) {
          return reject(error); // Reject promise if an error occurs
        }
        resolve(results); // Resolve promise with query results
      });
    });

    console.log("Order placed with ID:", result.insertId);
    return result.insertId;
  } catch (error) {
    console.error("Error while placing the order:", error.message);
    throw new Error("Failed to place order");
  }
}

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
        o.created_at,
        o.price
      FROM orders o
      WHERE o.user_id = ?`,
      [userId]
    );
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};
