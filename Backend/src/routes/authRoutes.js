// src/routes/authRoutes.js
//
// Route definitions for /api/auth.
// Knows WHICH URLs exist and which controller handles them — nothing else.

const { Router } = require("express");
const { register, login, me } = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me  — protected: valid JWT required
router.get("/me", authenticate, me);

module.exports = router;
