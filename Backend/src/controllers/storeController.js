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

async function create(req, res, next) {
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
    return next(error);
  }
}

async function getAll(_req, res, next) {
  try {
    const stores = await getAllStores();

    return res.status(200).json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const store = await getStoreById(id);

    return res.status(200).json({
      success: true,
      data: { store },
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
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
    return next(error);
  }
}

async function remove(req, res, next) {
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
    return next(error);
  }
}

module.exports = { create, getAll, getById, update, remove };

