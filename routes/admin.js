import express from "express";
import {
  UpdateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/adminController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Fetch all users
router.get("/admin/users", adminAuth, getAllUsers);

// Delete a users
router.delete("/admin/users/:id", adminAuth, deleteUser);

export default router;
