import { db } from "../db.js";
import crypto from "crypto"
import jwt from "jsonwebtoken"

export const resetPasswordHandler = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
      return res.status(400).send("OTP and new password are required");
    }

    // Check if OTP is valid (numeric and not more than 6 digits)
    if (!/^\d{1,6}$/.test(otp)) {
      return res.status(400).json({ error: "Invalid OTP format." });
    }

    // Check if the OTP matches in the database
    const [user] = await db
      .promise()
      .execute("SELECT * FROM users WHERE otp = ?", [otp]);
    if (user.length === 0) {
      return res.status(404).json({ error: "Invalid OTP." });
    }

    //generate a random secret key
    const secretKey = crypto.randomBytes(32).toString("hex");
    // console.log("Secret Key:", secretKey);

    // Update the user's password in the database
    await db
      .promise()
      .execute(
        "UPDATE users SET password = ?, confirmPassword = ?, otp = NULL WHERE otp = ?",
        [newPassword, newPassword, otp]
      );

    // Sign a JWT token with the user's id and username
    const payload = { id: user[0].id, username: user[0].username };
    const token = jwt.sign(payload, secretKey);

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      username: user[0].username,
      token: token,
      secretKey,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
