// routes/admin.js
import express from "express";
const router = express.Router();
import adminController from "../controllers/admin.mjs";

router.get("/", adminController.getIndex);
router.get("/products", adminController.getProducts);
router.get("/products/:productId", adminController.getProduct);
router.post("/add-product", adminController.postAddProduct);

export default router;
