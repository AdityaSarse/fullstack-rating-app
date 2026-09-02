// src/services/userService.js
//
// Business logic for user management operations (ADMIN).

const prisma = require("../lib/prisma");

async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // passwordHash is intentionally excluded at the database query level
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getUserById(userId) {
  if (!userId || typeof userId !== "string" || !UUID_REGEX.test(userId.trim())) {
    const error = new Error("Invalid user ID format.");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId.trim() },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // passwordHash is intentionally excluded at the database query level
    },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
}

// ── Update user (ADMIN only) ──────────────────────────────────────────────────

const ALLOWED_UPDATE_ROLES = ["USER", "STORE_OWNER"];

function validateUserUpdateInput({ name, email, address, role }) {
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 20) {
      errors.push("name must be at least 20 characters.");
    } else if (name.trim().length > 60) {
      errors.push("name must be at most 60 characters.");
    }
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push("email must be a valid email address.");
    }
  }

  if (address !== undefined) {
    if (typeof address !== "string" || address.trim().length === 0) {
      errors.push("address cannot be empty.");
    } else if (address.trim().length > 400) {
      errors.push("address must be at most 400 characters.");
    }
  }

  if (role !== undefined) {
    if (role === "ADMIN") {
      errors.push("Cannot assign the ADMIN role through this endpoint.");
    } else if (!ALLOWED_UPDATE_ROLES.includes(role)) {
      errors.push(`role must be one of: ${ALLOWED_UPDATE_ROLES.join(", ")}.`);
    }
  }

  return errors;
}

async function updateUser({ userId, name, email, address, role }) {
  if (!userId || typeof userId !== "string" || !UUID_REGEX.test(userId.trim())) {
    const error = new Error("Invalid user ID format.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Validate fields
  const validationErrors = validateUserUpdateInput({ name, email, address, role });
  if (validationErrors.length > 0) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.details = validationErrors;
    throw error;
  }

  const cleanUserId = userId.trim();

  // 2. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: cleanUserId },
  });

  if (!existingUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. If email changed, check uniqueness
  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (emailInUse) {
        const error = new Error("Email is already in use by another account.");
        error.statusCode = 409;
        throw error;
      }
    }
  }

  // 4. Construct update payload (only allowed fields)
  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name.trim();
  if (email !== undefined) dataToUpdate.email = email.trim().toLowerCase();
  if (address !== undefined) dataToUpdate.address = address.trim();
  if (role !== undefined) dataToUpdate.role = role;

  const updatedUser = await prisma.user.update({
    where: { id: cleanUserId },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // passwordHash is intentionally excluded
    },
  });

  return updatedUser;
}

// ── Delete user (ADMIN only) ──────────────────────────────────────────────────

async function deleteUser({ userId }) {
  if (!userId || typeof userId !== "string" || !UUID_REGEX.test(userId.trim())) {
    const error = new Error("Invalid user ID format.");
    error.statusCode = 400;
    throw error;
  }

  const cleanUserId = userId.trim();

  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: cleanUserId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!existingUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Protection: Do not allow deletion of ADMIN accounts
  if (existingUser.role === "ADMIN") {
    const error = new Error("Forbidden. Admin accounts cannot be deleted through this endpoint.");
    error.statusCode = 403;
    throw error;
  }

  // 3. Find any stores owned by this user
  const ownedStores = await prisma.store.findMany({
    where: { ownerId: cleanUserId },
    select: { id: true },
  });
  const ownedStoreIds = ownedStores.map((s) => s.id);

  // 4. Atomically cascade delete dependent ratings, owned stores, and user
  await prisma.$transaction([
    // Delete ratings submitted to stores owned by this user
    ...(ownedStoreIds.length > 0
      ? [
          prisma.rating.deleteMany({
            where: { storeId: { in: ownedStoreIds } },
          }),
        ]
      : []),
    // Delete stores owned by this user
    prisma.store.deleteMany({
      where: { ownerId: cleanUserId },
    }),
    // Delete ratings submitted by this user
    prisma.rating.deleteMany({
      where: { userId: cleanUserId },
    }),
    // Delete the user record
    prisma.user.delete({
      where: { id: cleanUserId },
    }),
  ]);

  return existingUser;
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
