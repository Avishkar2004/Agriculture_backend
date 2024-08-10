import jwt from "jsonwebtoken";
import { db } from "../db.js";
import bcrypt from "bcrypt";

export const userHandler = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "Username is already taken. Please choose another." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO users (username, email, password, confirmPassword) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, hashedPassword]
      );

    const user = { id: result.insertId, username };
    const secretKey = process.env.SECRET_KEY;

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
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    console.error("Error inserting user into database:", error);
    res.status(500).send("Internal Server Error");
  }
};
