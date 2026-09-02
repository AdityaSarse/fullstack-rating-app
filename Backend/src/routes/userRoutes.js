const { Router } = require("express");
const { getAll, getById, update, remove } = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = Router();

// GET /api/users — ADMIN only
router.get("/", authenticate, requireRole("ADMIN"), getAll);

// GET /api/users/:id — ADMIN only
router.get("/:id", authenticate, requireRole("ADMIN"), getById);

// PUT /api/users/:id — ADMIN only
router.put("/:id", authenticate, requireRole("ADMIN"), update);

// DELETE /api/users/:id — ADMIN only
router.delete("/:id", authenticate, requireRole("ADMIN"), remove);

module.exports = router;
