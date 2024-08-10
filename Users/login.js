import { db } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the username exists in the database
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);

    // Assuming you're storing hashed passwords
    const storedHashedPassword = existingUser[0]?.password;

    // Validate password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      storedHashedPassword
    );

    if (!existingUser.length || !isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Generate a JWT token with non-sensitive information
    const secretKey = process.env.SECRET_KEY;
    const user = { id: existingUser[0].id, username: existingUser[0].username };
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
