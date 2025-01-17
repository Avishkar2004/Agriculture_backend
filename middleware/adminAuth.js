export const adminAuth = (req, res, next) => {
  const adminEmail = "kakdevicky476@gmail.com";
  const adminUsername = "Avishkar";
  if (
    req.user &&
    req.user.email === adminEmail &&
    req.user.username === adminUsername
  ) {
    next(); // Grant access if both match
  } else {
    res.status(403).send("Access Denied");
  }
};
