// src/server.js

require("dotenv/config");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/users", userRoutes);

// Health check — useful for verifying the server is running
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
