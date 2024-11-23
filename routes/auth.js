import express from "express";
import passport from "passport";
import { loginSuccessHandler } from "../controllers/authController.js";

const router = express.Router();

// Google Login
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

// GitHub Login
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub Callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login", // Redirect on failure
  }),
  (req, res) => {
    // Successful login
    loginSuccessHandler(req, res);
  }
);

export default router;
