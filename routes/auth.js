import express from "express";
import passport from "passport";
import { loginSuccessHandler } from "../controllers/authController.js";

const router = express.Router();

// authRouter.js
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication failed." });
    }
    // console.log("Authenticated User:", req.user);
    // Pass query param for redirect
    loginSuccessHandler(req, res);
  }
);

export default router;
