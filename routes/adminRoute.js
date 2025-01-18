import express from "express";
import {
  UpdateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/adminController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { authenticateToken } from "../middleware/User.js";

const router = express.Router();

// Fetch all users
router.get("/admin/users", authenticateToken, adminAuth, getAllUsers);
// delete the user
router.delete("/admin/users/:id", authenticateToken, adminAuth, deleteUser);

export default router;
