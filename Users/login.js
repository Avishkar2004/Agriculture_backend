import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the username exists in the database
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length === 0 || existingUser[0].password !== password) {
      return res
        .status(401)
        .json({ error: "Both username and password are wrong." });
    }

    // Generate a random secret key
    const secretKey = process.env.SECRET_KEY; // Ensure you have this in your .env file
    const user = { id: existingUser[0].id, username, password };
    const token = jwt.sign(user, secretKey, {
      expiresIn: "1h",
      algorithm: "HS256",
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
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
