import { db } from "../db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const userHandler = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  console.log("Request Body:", req.body); // Log the entire request body
  try {
    // check if the username already exists
    const [existingUser] = await db
      .promise()
      .execute("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUser.length > 0) {
      // If username already exists, return a message and prompt user to choose another
      return res
        .status(400)
        .json({ message: "Username is already taken. Please choose another." });
    }

    // if the username is not taken, proceed with the insertion
    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO users (username, email, password, confirmpassword) VALUES (?, ?, ?, ?)",
        [username, email, password, confirmPassword]
      );

    const user = { id: result.insertId, username, password }; // Assuming your result object has an insertId property
    // Generate a random secret key
    const secretKey = crypto.randomBytes(32).toString("hex");
    console.log("Secret Key:", secretKey);

    // If the insertion is successful, return a success message along with user details

    const token = jwt.sign(user, secretKey, { expiresIn: "10days" }); // Set expiration time
    res.cookie("authToken", token, { httpOnly: true, sameSite: "strict" });
    // Do not include the password in the response
    // delete user.password;
    res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      secretKey,
      token,
    });
    console.log(result);
  } catch (error) {
    console.error(
      "Error inserting user into database/ Failed to Sign in:",
      error
    );
    res.status(500).send("Internal Server Error");
  }
};
