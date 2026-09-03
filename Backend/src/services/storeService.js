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
    // ADMIN: ownerId must be supplied in the request body and be a valid UUID
    if (!bodyOwnerId || typeof bodyOwnerId !== "string" || !UUID_REGEX.test(bodyOwnerId.trim())) {
      const error = new Error("ownerId is required and must be a valid UUID.");
      error.statusCode = 422;
      throw error;
    }

    const cleanOwnerId = bodyOwnerId.trim();

    // Verify the specified owner exists and has the STORE_OWNER role
    const owner = await prisma.user.findUnique({
      where: { id: cleanOwnerId },
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
      where: { ownerId: cleanOwnerId },
    });

    if (existingStore) {
      const error = new Error("This user already owns a store.");
      error.statusCode = 409;
      throw error;
    }

    resolvedOwnerId = cleanOwnerId;
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

// ── Get all stores (public) ───────────────────────────────────────────────────

async function getAllStores() {
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      ownerId: true,
      ratings: {
        select: {
          value: true,
        },
      },
      _count: {
        select: {
          ratings: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return stores.map((store) => {
    const ratingCount = store._count.ratings;
    let averageRating = null;

    if (ratingCount > 0) {
      const sum = store.ratings.reduce((acc, curr) => acc + curr.value, 0);
      averageRating = Number((sum / ratingCount).toFixed(1));
    }

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      averageRating,
      ratingCount,
    };
  });
}

// ── Get store by ID (public) ──────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getStoreById(storeId) {
  if (!storeId || typeof storeId !== "string" || !UUID_REGEX.test(storeId.trim())) {
    const error = new Error("Invalid store ID format.");
    error.statusCode = 400;
    throw error;
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId.trim() },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      ownerId: true,
      ratings: {
        select: {
          value: true,
        },
      },
      _count: {
        select: {
          ratings: true,
        },
      },
    },
  });

  if (!store) {
    const error = new Error("Store not found.");
    error.statusCode = 404;
    throw error;
  }

  const ratingCount = store._count.ratings;
  let averageRating = null;

  if (ratingCount > 0) {
    const sum = store.ratings.reduce((acc, curr) => acc + curr.value, 0);
    averageRating = Number((sum / ratingCount).toFixed(1));
  }

  return {
    id: store.id,
    name: store.name,
    email: store.email,
    address: store.address,
    ownerId: store.ownerId,
    averageRating,
    ratingCount,
  };
}

// ── Update store (ADMIN / STORE_OWNER) ────────────────────────────────────────

async function updateStore({ storeId, name, email, address, requestingUser }) {
  if (!storeId || typeof storeId !== "string" || !UUID_REGEX.test(storeId.trim())) {
    const error = new Error("Invalid store ID format.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Validate fields to update
  const validationErrors = validateStoreInput({ name, email, address });
  if (validationErrors.length > 0) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.details = validationErrors;
    throw error;
  }

  // 2. Check if store exists
  const existingStore = await prisma.store.findUnique({
    where: { id: storeId.trim() },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!existingStore) {
    const error = new Error("Store not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Resource ownership authorization:
  //    STORE_OWNER can only update their own store. ADMIN can update any store.
  if (requestingUser.role === "STORE_OWNER" && existingStore.ownerId !== requestingUser.id) {
    const error = new Error("Forbidden. You do not have permission to update this store.");
    error.statusCode = 403;
    throw error;
  }

  // 4. Update the store (ownerId is never modified)
  const updatedStore = await prisma.store.update({
    where: { id: storeId.trim() },
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedStore;
}

// ── Delete store (ADMIN / STORE_OWNER) ────────────────────────────────────────

async function deleteStore({ storeId, requestingUser }) {
  if (!storeId || typeof storeId !== "string" || !UUID_REGEX.test(storeId.trim())) {
    const error = new Error("Invalid store ID format.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Check if store exists
  const existingStore = await prisma.store.findUnique({
    where: { id: storeId.trim() },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  if (!existingStore) {
    const error = new Error("Store not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Resource ownership authorization:
  //    STORE_OWNER can only delete their own store. ADMIN can delete any store.
  if (requestingUser.role === "STORE_OWNER" && existingStore.ownerId !== requestingUser.id) {
    const error = new Error("Forbidden. You do not have permission to delete this store.");
    error.statusCode = 403;
    throw error;
  }

  // 3. Atomically remove associated ratings and the store
  await prisma.$transaction([
    prisma.rating.deleteMany({
      where: { storeId: storeId.trim() },
    }),
    prisma.store.delete({
      where: { id: storeId.trim() },
    }),
  ]);

  return { id: existingStore.id, name: existingStore.name };
}

module.exports = { createStore, getAllStores, getStoreById, updateStore, deleteStore };
