// src/services/ratingService.js
//
// Business logic for ratings.
// Knows HOW to create/manage ratings — not HTTP specifics.

const prisma = require("../lib/prisma");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateRatingInput({ storeId, value }) {
  const errors = [];

  if (!storeId || typeof storeId !== "string" || !UUID_REGEX.test(storeId.trim())) {
    errors.push("storeId is required and must be a valid UUID.");
  }

  if (value === undefined || value === null) {
    errors.push("value is required.");
  } else if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    errors.push("value must be an integer between 1 and 5.");
  }

  return errors;
}

async function submitRating({ userId, storeId, value }) {
  // 1. Validate input
  const validationErrors = validateRatingInput({ storeId, value });
  if (validationErrors.length > 0) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.details = validationErrors;
    throw error;
  }

  const cleanStoreId = storeId.trim();

  // 2. Check store existence
  const store = await prisma.store.findUnique({
    where: { id: cleanStoreId },
    select: { id: true },
  });

  if (!store) {
    const error = new Error("Store not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Check for existing rating by this user for this store (one rating per user/store)
  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId: cleanStoreId,
      },
    },
  });

  if (existingRating) {
    const error = new Error("You have already submitted a rating for this store.");
    error.statusCode = 409;
    throw error;
  }

  // 4. Create new rating
  const rating = await prisma.rating.create({
    data: {
      userId,
      storeId: cleanStoreId,
      value,
    },
    select: {
      id: true,
      value: true,
      storeId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return rating;
}

// ── Update rating (USER only, own rating only) ────────────────────────────────

async function updateRating({ ratingId, userId, value }) {
  if (!ratingId || typeof ratingId !== "string" || !UUID_REGEX.test(ratingId.trim())) {
    const error = new Error("Invalid rating ID format.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Validate value
  if (value === undefined || value === null) {
    const error = new Error("value is required.");
    error.statusCode = 422;
    error.details = ["value is required."];
    throw error;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.details = ["value must be an integer between 1 and 5."];
    throw error;
  }

  const cleanRatingId = ratingId.trim();

  // 2. Check if rating exists
  const existingRating = await prisma.rating.findUnique({
    where: { id: cleanRatingId },
    select: {
      id: true,
      userId: true,
      storeId: true,
    },
  });

  if (!existingRating) {
    const error = new Error("Rating not found.");
    error.statusCode = 404;
    throw error;
  }

  // 3. Ownership check: user can only update their own rating
  if (existingRating.userId !== userId) {
    const error = new Error("Forbidden. You do not have permission to update this rating.");
    error.statusCode = 403;
    throw error;
  }

  // 4. Update the rating (userId and storeId remain untouched)
  const updatedRating = await prisma.rating.update({
    where: { id: cleanRatingId },
    data: {
      value,
    },
    select: {
      id: true,
      value: true,
      storeId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedRating;
}

// ── Get ratings for a store (Public) ──────────────────────────────────────────

async function getRatingsForStore(storeId) {
  if (!storeId || typeof storeId !== "string" || !UUID_REGEX.test(storeId.trim())) {
    const error = new Error("Invalid store ID format.");
    error.statusCode = 400;
    throw error;
  }

  const cleanStoreId = storeId.trim();

  // 1. Verify store exists
  const store = await prisma.store.findUnique({
    where: { id: cleanStoreId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!store) {
    const error = new Error("Store not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Fetch ratings with user name and id
  const ratings = await prisma.rating.findMany({
    where: { storeId: cleanStoreId },
    select: {
      id: true,
      value: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 3. Compute count and average
  const ratingCount = ratings.length;
  let averageRating = null;

  if (ratingCount > 0) {
    const sum = ratings.reduce((acc, curr) => acc + curr.value, 0);
    averageRating = Number((sum / ratingCount).toFixed(1));
  }

  return {
    store: {
      id: store.id,
      name: store.name,
      averageRating,
      ratingCount,
    },
    ratings,
  };
}

module.exports = { submitRating, updateRating, getRatingsForStore };
