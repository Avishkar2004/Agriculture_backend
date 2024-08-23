import { db } from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import "dotenv/config";

//! For Login
export const loginHandler = async (req, res) => {
  const { username, password } = req.body;
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

    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production", // Ensure secure flag is set for production
    });

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
  const { username, email, password, confirmPassword } = req.body;

  try {
    // Check if the username already exists
    const [existingUsername] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUsername.length > 0) {
      return res
        .status(400)
        .json({ message: "Username is already taken. Please choose another." });
    }

    // Check if the email already exists
    const [existingEmail] = await db
      .promise()
      .execute("SELECT * FROM users WHERE email = ?", [email]);

    if (existingEmail.length > 0) {
      return res
        .status(400)
        .json({ message: "Email is already used. Please use another email." });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );

    const user = { id: result.insertId, username };
    const secretKey = process.env.SECRET_KEY;

    // Generate JWT token
    const token = jwt.sign(user, secretKey, {
      expiresIn: "1h",
      algorithm: "HS256",
    });

    // Set auth token in cookies
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    console.error("Error inserting user into database:", error);
    res.status(500).send("Internal Server Error");
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
