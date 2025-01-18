import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  const token = req.cookies.authToken; // Use cookie-based JWT for validation

  if (!token) {
    return res.status(403).send("Access Denied: No token provided.");
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send("Access Denied: Invalid token.");
    }

    console.log("Decoded token:", decoded); // Add this to see the contents of the decoded token

    // Ensure decoded user data exists
    if (!decoded || !decoded.username || !decoded.email) {
      return res.status(403).send("Access Denied: Missing user data in token.");
    }

    req.user = decoded; // Attach the decoded user data to the request

    // Check if the user is the admin based on email and username
    const adminEmail = "kakdevicky476@gmail.com";
    const adminUsername = "Avishkar";

    if (
      req.user.username.toLowerCase() === adminUsername.toLowerCase() &&
      req.user.email.toLowerCase() === adminEmail.toLowerCase()
    ) {
      return next(); // Proceed if the user is admin
    }

    return res.status(403).send("Access Denied: Unauthorized admin.");
  });
};
