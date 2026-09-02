// src/routes/storeRoutes.js
//
// Route definitions for /api/stores.

const { Router } = require("express");
const { create } = require("../controllers/storeController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = Router();

// POST /api/stores
// ADMIN  → can create a store for any STORE_OWNER (ownerId required in body)
// STORE_OWNER → creates a store for themselves (ownerId from JWT, not body)
// USER   → 403 Forbidden
router.post("/", authenticate, requireRole("ADMIN", "STORE_OWNER"), create);

module.exports = router;
