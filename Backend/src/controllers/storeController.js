// src/controllers/storeController.js
//
// HTTP layer for store operations.
// Extracts request data, calls the service, maps results to HTTP responses.

const {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
} = require("../services/storeService");

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

async function getAll(_req, res) {
  try {
    const stores = await getAllStores();

    return res.status(200).json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
    });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const store = await getStoreById(id);

    return res.status(200).json({
      success: true,
      data: { store },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
    });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    const store = await updateStore({
      storeId: id,
      name,
      email,
      address,
      requestingUser: req.user, // { id, role } from verified JWT
    });

    return res.status(200).json({
      success: true,
      message: "Store updated successfully.",
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

async function remove(req, res) {
  try {
    const { id } = req.params;

    const result = await deleteStore({
      storeId: id,
      requestingUser: req.user, // { id, role } from verified JWT
    });

    return res.status(200).json({
      success: true,
      message: `Store '${result.name}' deleted successfully.`,
      data: { store: result },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
    });
  }
}

module.exports = { create, getAll, getById, update, remove };
