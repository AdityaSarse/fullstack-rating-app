const { Router } = require("express");
const { create, getAll, getById, update, remove } = require("../controllers/storeController");
const { getStoreRatings } = require("../controllers/ratingController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = Router();

// GET /api/stores — public endpoint
router.get("/", getAll);

// GET /api/stores/:id — public endpoint
router.get("/:id", getById);

// GET /api/stores/:storeId/ratings — public endpoint
router.get("/:storeId/ratings", getStoreRatings);

// POST /api/stores
// ADMIN  → can create a store for any STORE_OWNER (ownerId required in body)
// STORE_OWNER → creates a store for themselves (ownerId from JWT, not body)
// USER   → 403 Forbidden
router.post("/", authenticate, requireRole("ADMIN", "STORE_OWNER"), create);

// PUT /api/stores/:id
// ADMIN  → can update any store
// STORE_OWNER → can only update their own store (resource authorization in service)
// USER   → 403 Forbidden
router.put("/:id", authenticate, requireRole("ADMIN", "STORE_OWNER"), update);

// DELETE /api/stores/:id
// ADMIN  → can delete any store
// STORE_OWNER → can only delete their own store (resource authorization in service)
// USER   → 403 Forbidden
router.delete("/:id", authenticate, requireRole("ADMIN", "STORE_OWNER"), remove);

module.exports = router;
