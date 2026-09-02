// src/services/storeService.js
//
// Business logic for store operations.
// Knows HOW to create a store — not what HTTP is.
//
// Role-specific behavior:
//
//   STORE_OWNER → ownerId is always req.user.id (from JWT, never from body)
//                 One store per owner enforced by DB @@unique(ownerId)
//
//   ADMIN       → ownerId supplied in request body
//                 Validated: must exist, must be STORE_OWNER role

const prisma = require("../lib/prisma");

// ── Validation ────────────────────────────────────────────────────────────────

function validateStoreInput({ name, email, address }) {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("name is required.");
  } else if (name.trim().length > 255) {
    errors.push("name must be at most 255 characters.");
  }

  if (!email || typeof email !== "string") {
    errors.push("email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("email must be a valid email address.");
  }

  if (!address || typeof address !== "string" || address.trim().length === 0) {
    errors.push("address is required.");
  } else if (address.trim().length > 400) {
    errors.push("address must be at most 400 characters.");
  }

  return errors;
}

// ── Service function ──────────────────────────────────────────────────────────

async function createStore({ name, email, address, requestingUser, ownerId: bodyOwnerId }) {
  // 1. Validate common fields
  const validationErrors = validateStoreInput({ name, email, address });
  if (validationErrors.length > 0) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.details = validationErrors;
    throw error;
  }

  let resolvedOwnerId;

  if (requestingUser.role === "STORE_OWNER") {
    // STORE_OWNER: ownerId is always the authenticated user's own ID.
    // Ignore any ownerId from the request body — a store owner cannot
    // assign the store to another user.
    resolvedOwnerId = requestingUser.id;

    // Check if this STORE_OWNER already has a store (ownerId is @unique in schema)
    const existingStore = await prisma.store.findUnique({
      where: { ownerId: resolvedOwnerId },
    });

    if (existingStore) {
      const error = new Error("You already own a store. A store owner can only have one store.");
      error.statusCode = 409;
      throw error;
    }

  } else if (requestingUser.role === "ADMIN") {
    // ADMIN: ownerId must be supplied in the request body
    if (!bodyOwnerId || typeof bodyOwnerId !== "string") {
      const error = new Error("ownerId is required when an ADMIN creates a store.");
      error.statusCode = 422;
      throw error;
    }

    // Verify the specified owner exists and has the STORE_OWNER role
    const owner = await prisma.user.findUnique({
      where: { id: bodyOwnerId },
      select: { id: true, role: true },
    });

    if (!owner) {
      const error = new Error("The specified ownerId does not correspond to any user.");
      error.statusCode = 422;
      throw error;
    }

    if (owner.role !== "STORE_OWNER") {
      const error = new Error(
        "The specified user does not have the STORE_OWNER role. Only STORE_OWNER users can own a store."
      );
      error.statusCode = 422;
      throw error;
    }

    // Check if this owner already has a store
    const existingStore = await prisma.store.findUnique({
      where: { ownerId: bodyOwnerId },
    });

    if (existingStore) {
      const error = new Error("This user already owns a store.");
      error.statusCode = 409;
      throw error;
    }

    resolvedOwnerId = bodyOwnerId;
  }

  // 2. Create the store
  const store = await prisma.store.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      ownerId: resolvedOwnerId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      ownerId: true,
      createdAt: true,
    },
  });

  return store;
}

module.exports = { createStore };
