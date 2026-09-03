// src/controllers/userController.js
//
// HTTP layer for user management operations (ADMIN).

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../services/userService");

async function getAll(_req, res, next) {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
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
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const user = await deleteUser({ userId: id });

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' deleted successfully.`,
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, update, remove };

