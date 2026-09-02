// src/controllers/ratingController.js
//
// HTTP layer for rating operations.

const {
  submitRating,
  updateRating,
  getRatingsForStore,
} = require("../services/ratingService");

async function submit(req, res) {
  try {
    const { storeId, value } = req.body;

    const rating = await submitRating({
      userId: req.user.id, // from verified JWT — never from body
      storeId,
      value,
    });

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully.",
      data: { rating },
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

async function update(req, res) {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const rating = await updateRating({
      ratingId: id,
      userId: req.user.id, // from verified JWT
      value,
    });

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully.",
      data: { rating },
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

async function getStoreRatings(req, res) {
  try {
    const { storeId } = req.params;

    const result = await getRatingsForStore(storeId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
    });
  }
}

module.exports = { submit, update, getStoreRatings };
