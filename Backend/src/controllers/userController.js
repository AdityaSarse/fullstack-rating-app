// src/controllers/userController.js
//
// HTTP layer for user management operations (ADMIN).

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../services/userService");

async function getAll(_req, res) {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      data: { users },
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
    const user = await getUserById(id);

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

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;

    const user = await updateUser({
      userId: id,
      name,
      email,
      address,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
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

async function remove(req, res) {
  try {
    const { id } = req.params;

    const user = await deleteUser({ userId: id });

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' deleted successfully.`,
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

module.exports = { getAll, getById, update, remove };
