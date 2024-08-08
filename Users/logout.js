export const logout = (req, res) => {
    try {
      // Clear the cookie, ensure options match those used when the cookie was set
      res.clearCookie("authToken", { 
        httpOnly: true, 
        sameSite: "strict",
        path: "/",  // Ensure the path matches
        // domain: "your-domain.com", // Uncomment and specify if a domain was used
        // secure: true, // Uncomment if the cookie was set with secure option
      });
  
      // Send response
      res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ success: false, message: "An error occurred during logout." });
    }
  };
  