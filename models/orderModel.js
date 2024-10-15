import { db } from "../config/db.js";

export async function createOrder(orderData) {
  const query = `
    INSERT INTO orders (
      product_name,
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
      order_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;

  const values = [
    orderData.productName,
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
