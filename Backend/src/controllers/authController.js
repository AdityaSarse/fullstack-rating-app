// src/controllers/authController.js
//
// HTTP layer for authentication.
// Knows WHAT to do with an HTTP request — not how to register a user.
//
// Responsibilities:
//   - Extract data from req.body
//   - Call the service
//   - Map service results/errors to HTTP responses

const { registerUser, loginUser, getMe } = require("../services/authService");

async function register(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    const user = await registerUser({ name, email, password, address, role });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: { user },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
      ...(error.details && { errors: error.details }),
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result, // { token, user }
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
      ...(error.details && { errors: error.details }),
    });
  }
}

async function me(req, res) {
  try {
    // req.user.id comes from the verified JWT — never from user input
    const user = await getMe(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
    });
  }
}

module.exports = { register, login, me };
