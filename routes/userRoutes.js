import express from "express";
import { deleteUserHandler } from "../controllers/authController.js";

const router = express.Router();


// Add the delete user route
router.delete('/users/:id', deleteUserHandler); // Route for deleting user by ID

export default router;
