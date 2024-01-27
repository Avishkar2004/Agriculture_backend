// import { db } from "../db.js";
// import crypto from "crypto"
// import jwt from 'jsonwebtoken'

// export const loginHandler = (() => async (req, res) => {
//     const { username, password } = req.body;
//     try {
//       // Check if the username exists in the database
//       const [existingUser] = await db
//         .promise()
//         .execute("SELECT * FROM users WHERE username = ?", [username]);
//       if (existingUser.length === 0 || existingUser[0].password !== password) {
//         // both cases are treated the same  wat to provide a generic error message
//         return res
//           .status(401)
//           .json({ error: "Both username and password are wrong." });
//       }
//       if (existingUser.length === 0) {
//         return res.status(401).json({ error: "Username not found." });
//       }
//       // Check if the provided password matches the stored password
//       if (existingUser[0].password !== password) {
//         return res.status(401).json({
//           error:
//             "Sorry, your password was incorrect. Please double-check your password.",
//         });
//       }
//       // Generate a random secret key
//       const secretKey = crypto.randomBytes(32).toString("hex");
//       // console.log("Secret Key:", secretKey);
  
//       // If username and password are correct, you can consider the user logged in
//       const user = { id: existingUser[0].id, username, password };
//       const token = jwt.sign(user, secretKey);
  
//       res.cookie("authToken", token, { httpOnly: true, sameSite: "strict" });
  
//       res.status(200).json({
//         success: true,
//         message: "Login successful.",
//         user,
//         secretKey,
//         token,
//       });
//     } catch (error) {
//       console.error("Error during login:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });