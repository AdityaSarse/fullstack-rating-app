// src/services/authService.js
//
// Business logic layer for authentication.
// Knows HOW to register a user — not what HTTP is.
//
// Responsibilities:
//   - Validate input fields
//   - Check email uniqueness
//   - Hash password
//   - Create user record
//   - Return safe user data (no passwordHash)

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = 12;

// Allowed roles for public registration.
// ADMIN is never created through this endpoint.
const ALLOWED_ROLES = ["USER", "STORE_OWNER"];

// ── Validation helpers ────────────────────────────────────────────────────────

function validateRegistrationInput({ name, email, password, address, role }) {
  const errors = [];

  // name: 20–60 characters
  if (!name || typeof name !== "string") {
    errors.push("name is required.");
  } else if (name.trim().length < 20) {
    errors.push("name must be at least 20 characters.");
  } else if (name.trim().length > 60) {
    errors.push("name must be at most 60 characters.");
  }

  // email: required, basic format check
  if (!email || typeof email !== "string") {
    errors.push("email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("email must be a valid email address.");
  }

  // password: 8–16 characters, at least one uppercase, at least one special character
  if (!password || typeof password !== "string") {
    errors.push("password is required.");
  } else {
    if (password.length < 8 || password.length > 16) {
      errors.push("password must be 8–16 characters.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("password must contain at least one uppercase letter.");
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push("password must contain at least one special character.");
    }
  }

  // address: max 400 characters
  if (!address || typeof address !== "string") {
    errors.push("address is required.");
  } else if (address.trim().length > 400) {
    errors.push("address must be at most 400 characters.");
  }

  // role: optional, defaults to USER; ADMIN is forbidden
  if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
    errors.push(`role must be one of: ${ALLOWED_ROLES.join(", ")}.`);
  }

  return errors;
}

// ── Service function ──────────────────────────────────────────────────────────

async function registerUser({ name, email, password, address, role }) {
  // 1. Validate input
  const validationErrors = validateRegistrationInput({
    name,
    email,
    password,
    address,
    role,
  });

  if (validationErrors.length > 0) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.details = validationErrors;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const resolvedRole = role || "USER"; // default to USER when omitted

  // 2. Check email uniqueness
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  // 3. Hash password — never store plaintext
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      address: address.trim(),
      role: resolvedRole,
    },
    // Explicitly select fields to return — passwordHash is never included
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

// ── Login ─────────────────────────────────────────────────────────────────────

function validateLoginInput({ email, password }) {
  const errors = [];

  if (!email || typeof email !== "string") {
    errors.push("email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("email must be a valid email address.");
  }

  if (!password || typeof password !== "string") {
    errors.push("password is required.");
  }

  return errors;
}

async function loginUser({ email, password }) {
  // 1. Validate input presence/format
  const validationErrors = validateLoginInput({ email, password });
  if (validationErrors.length > 0) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.details = validationErrors;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 2. Look up user — include passwordHash for comparison only
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      passwordHash: true, // needed here for bcrypt.compare — stripped before return
    },
  });

  // 3. Use the same generic error whether the email doesn't exist OR the
  //    password is wrong. Never reveal which credential was incorrect.
  const GENERIC_AUTH_ERROR = "Invalid email or password.";

  if (!user) {
    // Run a dummy compare so timing is consistent regardless of whether the
    // user exists — prevents timing-based user enumeration.
    await bcrypt.compare(password, "$2b$12$dummyhashfortimingconsistency000000000000000000000000");
    const error = new Error(GENERIC_AUTH_ERROR);
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const error = new Error(GENERIC_AUTH_ERROR);
    error.statusCode = 401;
    throw error;
  }

  // 4. Build JWT payload — minimum identity/authorization information only.
  //    Never put passwordHash, address, or other PII into the token.
  const payload = {
    sub: user.id,  // subject: the user's UUID
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // 5. Return token + safe user data. Strip passwordHash before returning.
  const { passwordHash: _removed, ...safeUser } = user;

  return { token, user: safeUser };
}

// ── Get current authenticated user ───────────────────────────────────────────────────

async function getMe(userId) {
  // The JWT already verified the user's identity. We query the database
  // to return the current profile — the JWT may be stale (e.g. role changed).
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      // passwordHash intentionally omitted
    },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
}

module.exports = { registerUser, loginUser, getMe };
