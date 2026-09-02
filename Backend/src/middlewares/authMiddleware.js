// src/middlewares/authMiddleware.js
//
// JWT authentication middleware.
// Verifies the token on every protected route — does NOT handle authorization
// (role checking). That's a separate concern handled elsewhere.
//
// Expected header format:
//   Authorization: Bearer <token>
//
// On success:  sets req.user = { id, role } and calls next()
// On failure:  responds 401 immediately — never calls next()

const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  // 1. Header must exist
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header is missing.",
    });
  }

  // 2. Must follow Bearer <token> format exactly
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header must use Bearer scheme.",
    });
  }

  const token = authHeader.slice(7); // everything after "Bearer "

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token is missing.",
    });
  }

  // 3. Verify the token — signature + expiration
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach minimum identity to req.user.
    //    sub = user UUID (set during login), role = user's role.
    //    Never trust these values from req.body or query params.
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    // Map specific JWT error types to clear messages.
    // Never expose internal error details to the client.
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }

    // JsonWebTokenError covers: invalid signature, malformed token, etc.
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
}

module.exports = { authenticate };
