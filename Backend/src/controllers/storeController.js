// src/controllers/storeController.js
//
// HTTP layer for store operations.
// Extracts request data, calls the service, maps results to HTTP responses.

const { createStore } = require("../services/storeService");

async function create(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    const store = await createStore({
      name,
      email,
      address,
      ownerId,             // only used when requestingUser.role === "ADMIN"
      requestingUser: req.user, // { id, role } from verified JWT — never from body
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully.",
      data: { store },
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

module.exports = { create };
