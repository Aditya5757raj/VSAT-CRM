const jwt = require('jsonwebtoken');

const verifyToken = (req) => {
  console.log("🔐 Authenticating request...");

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    const error = new Error("Access Denied. No token provided.");
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified. User ID:", decoded.id);
    return decoded.id;
  } catch (err) {
    const error = new Error("Invalid or expired token.");
    error.statusCode = 403;
    throw error;
  }
};

module.exports = {verifyToken};
