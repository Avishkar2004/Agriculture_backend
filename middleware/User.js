import jwt from "jsonwebtoken";
import "dotenv/config";

export const authenticateToken = (req, res, next) => {
  // console.log("Cookies in request:", req.cookies); // Log cookies
  const token = req.cookies.authToken;
  // console.log("Token :", token);
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    console.log(error.message); // Log error for debugging
    return res.status(401).json({ message: "Invalid Token" });
  }
};
