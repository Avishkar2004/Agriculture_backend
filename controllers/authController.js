import { db } from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import "dotenv/config";

//! For Login
export const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  const userAgent = req.headers["user-agent"];
  try {
    // Check if the username exists in the database
    const [results] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);
    const existingUser = results[0];

    if (!existingUser) {
      return res.status(401).json({ error: "Invalid username." });
    }

    // Validate password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Generate a JWT token
    const secretKey = process.env.SECRET_KEY;
    const user = { id: existingUser.id, username: existingUser.username };
    const token = jwt.sign(user, secretKey, {
      expiresIn: "1h",
      algorithm: "HS256",
    });

    await db
      .promise()
      .execute("UPDATE users SET last_login_browser = ? WHERE id = ?", [
        userAgent,
        existingUser.id,
      ]);

    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production", // Ensure secure flag is set for production
    });

    // Log the user login with browser info
    // console.log(`User ${username} logged in from browser: ${userAgent}`);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//! For Create a acc(Sign Up)
export const userHandler = async (req, res) => {
  const { username, email, password } = req.body;
  const userAgent = req.headers["user-agent"];
  try {
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ? OR email = ?", [
        username,
        email,
      ]);

    if (existingUser.length > 0) {
      const message =
        existingUser[0].username === username
          ? "Username is already taken. Please choose another."
          : "Email is already used. Please use another email.";
      return res.status(400).json({ message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO users (username, email, password, confirmPassword, last_login_browser) VALUES (?, ?, ?, ?, ?)",
        [username, email, hashedPassword, hashedPassword, userAgent]
      );

    const user = { id: result.insertId, username };
    const secretKey = process.env.SECRET_KEY;

    const token = jwt.sign(user, secretKey, {
      expiresIn: "1h",
      algorithm: "HS256",
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    // Log the user signup with browser info
    console.log(`User ${username} signed up from browser: ${userAgent}`);

    res.status(201).json({
      success: true,
      user,
      token,
      browserInfo: userAgent,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({
      message: "An error occurred during registration. Please try again.",
    });
  }
};

export const logout = (req, res) => {
  try {
    // Clear the cookie, ensure options match those used when the cookie was set
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "strict",
      path: "/", // Ensure the path matches
      secure: true,
    });

    // Send response
    res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during logout." });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  user: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const ForGetPassWord = async (req, res) => {
  try {
    const { email } = req.body;

    // Server-side email format validation
    if (!email || !email.includes("@gmail.com")) {
      return res.status(400).send("Please provide a valid Gmail address.");
    }

    // Check if the email exists in the database
    const [user] = await db
      .promise()
      .execute("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(404).json({ error: "Invalid email." });
    }
    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save the OTP in the database
    await db
      .promise()
      .execute("UPDATE users SET otp = ? WHERE email = ?", [otp, email]);

    // Compose email message and send it
    const mailOptions = {
      from: "kakdevicky476@gmail.com",
      to: email,
      subject: "Forgot Password OTP",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP via email:", error);
        return res.status(500).json({ error: "Error sending OTP via email." });
      }
      res
        .status(200)
        .json({ success: true, message: "OTP sent successfully." });
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

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
        "UPDATE users SET password = ?, confirmPassword = ?, otp = ?",
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
