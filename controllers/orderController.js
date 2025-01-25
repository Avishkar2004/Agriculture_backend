import {
  cancelOrderById,
  createOrder,
  createOrderCheckOut,
  getInvoiceDetails,
  getOrdersByUserId,
  trackOrderById,
} from "../models/orderModel.js";

import PDFDocument from "pdfkit";

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
