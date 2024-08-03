import jwt from "jsonwebtoken";
import "dotenv/config";

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;  // Make sure the key matches the one you set in the login route

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const secretKey = process.env.SECRET_KEY;
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
