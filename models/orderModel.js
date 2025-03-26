import { db } from "../config/db.js";

// Create order for single product
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `;

  const values = [
    orderData.product_name,
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
    orderData.totalPrice,
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
    return result.insertId;
  } catch (error) {
    console.error("Error while placing the order:", error.message);
    throw new Error("Failed to place order");
  }
}

// Fetch orders by user ID / Show in header Orders
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

// Create order for Multiple product
export async function createOrderCheckOut(orderData) {
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
    ) VALUES ?
  `;

  // Prepare the values as an array of arrays
  const values = orderData.products.map((product) => [
    product.productName,
    product.productId,
    orderData.userId,
    product.quantity,
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
    "pending", // Order status
    product.totalPrice,
  ]);

  try {
    // Execute the bulk insert
    const result = await new Promise((resolve, reject) => {
      db.query(query, [values], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    return result.insertId; // Return the first inserted ID
  } catch (error) {
    console.error("Error while placing the order:", error.message);
    throw new Error("Failed to place order");
  }
}

// Track order
export const trackOrderById = async (userId, orderId) => {
  try {
    const [order] = await db.promise().execute(
      `SELECT 
        o.id, 
        o.product_name, 
        o.quantity, 
        o.order_status, 
        o.created_at, 
        o.price,
        o.address, 
        o.city, 
        o.state, 
        o.zip_code, 
        o.country
      FROM orders o
      WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (order.length === 0) {
      throw new Error("Order not found");
    }

    return order[0];
  } catch (error) {
    throw new Error("Error fetching order: " + error.message);
  }
};

// Cancel the Order
export const cancelOrderById = async (userId, orderId) => {
  try {
    // Update the `order_status` to 'canceled'
    const [result] = await db.promise().execute(
      `UPDATE orders 
           SET order_status = 'Cancelled' 
           WHERE id = ? AND user_id = ? AND order_status = 'Pending'`,
      [orderId, userId]
    );

    return result; // Contains information about affected rows
  } catch (error) {
    throw new Error("Error canceling the order: " + error.message);
  }
};

// Generate Invoice

export const getInvoiceDetails = async (orderId, userId) => {
  try {
    const [order] = await db.promise().execute(
      `SELECT 
            o.id AS order_id,
            o.product_name,
            o.price,
            o.quantity,
            o.order_status,
            o.created_at,
            u.username,
            u.email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          WHERE o.id = ? AND o.user_id = ? AND o.order_status = 'Delivered'`,
      [orderId, userId || null]
    );

    if (order.length === 0) {
      throw new Error("Invoice not available for this order.");
    }
    return order[0];
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw new Error("Error fetching invoice: " + error.message);
  }
};
