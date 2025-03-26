import { db } from "../config/db.js";
import {
  cancelOrderById,
  createOrder,
  createOrderCheckOut,
  getInvoiceDetails,
  getOrdersByUserId,
  trackOrderById,
} from "../models/orderModel.js";
import { timeInMs } from "../utils/helper.js";

import PDFDocument from "pdfkit";

export async function placeOrder(req, res) {
  try {
    const orderData = req.body;
    const orderId = await createOrder(orderData);

    // Start auto status update
    await autoCompleteOrder(orderId);

    res.status(201).json({ message: "Order placed successfully!", orderId });
  } catch (error) {
    console.error("Order placement failed:", error.message);
    res
      .status(500)
      .json({ message: "Failed to place order, please try again later." });
  }
}

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getOrdersByUserId(userId);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (typeof status !== "string") {
      console.error("❌ Error: status is not a string!", status);
      return res.status(400).json({
        error: `Invalid order status: Expected a string, but got ${typeof status}`,
      });
    }

    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
    const formattedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    if (!validStatuses.includes(formattedStatus)) {
      return res.status(400).json({ error: `Invalid order status: ${status}` });
    }

    await db
      .promise()
      .execute(`UPDATE orders SET order_status = ? WHERE id = ?`, [
        formattedStatus,
        orderId,
      ]);
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("❌ Error updating order status:", error.message);
    res
      .status(500)
      .json({ error: "Error updating order status: " + error.message });
  }
};

export const autoCompleteOrder = async (orderId) => {
  try {
    // 🔹 Fetch the current order status
    const [rows] = await db
      .promise()
      .execute(`SELECT order_status FROM orders WHERE id = ?`, [orderId]);

    if (!rows.length) {
      console.warn(`⚠️ Order ${orderId} not found`);
      return;
    }

    const currentStatus = rows[0].order_status;

    // ✅ Stop if the order is already "Delivered" or "Cancelled"
    if (currentStatus === "Delivered" || currentStatus === "Cancelled") {
      return;
    }

    // 🔹 Update to "Shipped" after 3 seconds
    setTimeout(async () => {
      try {
        const [result] = await db
          .promise()
          .execute(`UPDATE orders SET order_status = 'Shipped' WHERE id = ?`, [
            orderId,
          ]);

        if (result.affectedRows > 0) {
          console.log(`✅ Order ${orderId} successfully marked as Shipped`);
        } else {
          console.warn(`⚠️ Order ${orderId} update failed (Shipped)`);
        }

        // ✅ Re-check status before updating to "Delivered"
        const [rowsAfterShip] = await db
          .promise()
          .execute(`SELECT order_status FROM orders WHERE id = ?`, [orderId]);

        if (rowsAfterShip[0].order_status !== "Shipped") {
          console.log(
            `⚠️ Order ${orderId} status changed externally. Skipping delivery update.`
          );
          return;
        }

        // 🔹 Update to "Delivered" after another 6 seconds
        setTimeout(async () => {
          try {
            const [delResult] = await db
              .promise()
              .execute(
                `UPDATE orders SET order_status = 'Delivered' WHERE id = ?`,
                [orderId]
              );

            if (delResult.affectedRows > 0) {
              console.log(
                `✅ Order ${orderId} successfully marked as Delivered`
              );
            } else {
              console.warn(`⚠️ Order ${orderId} update failed (Delivered)`);
            }
          } catch (error) {
            console.error(
              `❌ Error delivering order ${orderId}:`,
              error.message
            );
          }
        }, timeInMs({ days: 6 }));
      } catch (error) {
        console.error(`❌ Error shipping order ${orderId}:`, error.message);
      }
    }, timeInMs({ days: 3 }));
  } catch (error) {
    console.error(`❌ Error fetching order ${orderId} status:`, error.message);
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const [result] = await db
      .promise()
      .execute(`SELECT order_status FROM orders WHERE id = ?`, [orderId]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ status: result[0].order_status });
  } catch (error) {
    console.error("❌ Error fetching order status:", error.message);
    res.status(500).json({ error: "Error fetching order status" });
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
    const userId = req.user.id;
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
      return res.status(404).json({
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

// Generate Invoice
export const generateInvoice = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id; // Assume middleware sets `req.user`

  try {
    const invoiceDetails = await getInvoiceDetails(orderId, userId);

    if (!invoiceDetails) {
      return res.status(404).json({ message: "Invoice details not found." });
    }

    const doc = new PDFDocument({ margin: 40 });
    const filename = `Invoice-${orderId}.pdf`;

    // Set response headers for PDF download
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Header Section
    doc
      .fillColor("#2C3E50")
      .fontSize(24)
      .text("Invoice", { align: "center", underline: true });

    doc.moveDown();
    doc
      .fontSize(12)
      .text("Thank you for shopping with us!", { align: "center" });
    doc.moveDown(2);

    // Invoice Details Section
    doc
      .fillColor("#000")
      .fontSize(14)
      .text(`Order ID: ${invoiceDetails.order_id}`, { continued: true })
      .text(
        `  Date: ${new Date(invoiceDetails.created_at).toLocaleDateString()}`,
        {
          align: "right",
        }
      );

    doc.text(`Customer: ${invoiceDetails.username}`);
    doc.text(`Email: ${invoiceDetails.email}`);
    doc.moveDown();

    // Separator Line
    doc
      .strokeColor("#CCCCCC")
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(570, doc.y)
      .stroke();
    doc.moveDown(1);

    // Product Details Section
    doc.fontSize(14).text("Product Details", { underline: true }).moveDown();
    doc.fontSize(12).text(`Product: ${invoiceDetails.product_name}`);
    doc.text(`Quantity: ${invoiceDetails.quantity}`);
    doc.text(`Price: ₹${invoiceDetails.price.toLocaleString()}`);
    doc.text(`Order Status: ${invoiceDetails.order_status}`);
    doc.moveDown();

    // Payment Summary
    doc.fontSize(14).text("Payment Summary", { underline: true }).moveDown();
    doc
      .fontSize(12)
      .text(`Subtotal: ₹${(invoiceDetails.price * 0.82).toLocaleString()}`);
    doc.text(`Tax (18%): ₹${(invoiceDetails.price * 0.18).toFixed(2)}`);
    doc
      .fontSize(14)
      .fillColor("#2C3E50")
      .text(`Total: ₹${invoiceDetails.price.toLocaleString()}`, {
        align: "right",
      });

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .fillColor("#999999")
      .text("For any queries, contact support@example.com", {
        align: "center",
      });
    doc.text(
      "This is a computer-generated invoice, no signature is required.",
      {
        align: "center",
      }
    );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating invoice." });
  }
};
