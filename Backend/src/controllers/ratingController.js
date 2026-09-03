// src/controllers/ratingController.js
//
// HTTP layer for rating operations.

const {
  submitRating,
  updateRating,
  getRatingsForStore,
} = require("../services/ratingService");

async function submit(req, res, next) {
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
    return next(error);
  }
}

async function update(req, res, next) {
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
    return next(error);
  }
}

async function getStoreRatings(req, res, next) {
  try {
    const { storeId } = req.params;

    const result = await getRatingsForStore(storeId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { submit, update, getStoreRatings };

