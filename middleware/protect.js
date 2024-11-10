import jwt from "jsonwebtoken";
import "dotenv/config";

// Protect routes (ensure user is logged in)
export const protect = (req, res, next) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Attach the user to the request object
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};
