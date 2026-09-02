const { Router } = require("express");
const { submit, update } = require("../controllers/ratingController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = Router();

// POST /api/ratings
// USER         → can submit rating (201)
// ADMIN        → 403 Forbidden
// STORE_OWNER  → 403 Forbidden
router.post("/", authenticate, requireRole("USER"), submit);

// PUT /api/ratings/:id
// USER         → can update own rating (200)
// ADMIN        → 403 Forbidden
// STORE_OWNER  → 403 Forbidden
router.put("/:id", authenticate, requireRole("USER"), update);

module.exports = router;
