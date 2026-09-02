// src/middlewares/roleMiddleware.js
//
// Role-based authorization middleware factory.
// Must run AFTER authMiddleware — depends on req.user being set.
//
// Usage on a route:
//   router.get("/admin/users", authenticate, requireRole("ADMIN"), handler);
//   router.post("/ratings",    authenticate, requireRole("USER", "STORE_OWNER"), handler);
//
// What this does NOT do:
//   - Resource/ownership checks (e.g. "does this store belong to YOU?")
//     → That lives in the service layer, not here.
//   - Database queries — role comes from the verified JWT claim only.

// All valid roles in the system.
// Defined once here so a typo in a route fails loudly at startup,
// not silently at runtime.
const VALID_ROLES = Object.freeze(["ADMIN", "USER", "STORE_OWNER"]);

/**
 * Middleware factory — call it with one or more allowed roles.
 *
 * requireRole("ADMIN")
 * requireRole("ADMIN", "STORE_OWNER")
 *
 * Returns an Express middleware function.
 */
function requireRole(...allowedRoles) {
  // Validate the roles supplied by the developer at definition time,
  // not at request time — catches typos as early as possible.
  const invalid = allowedRoles.filter((r) => !VALID_ROLES.includes(r));
  if (invalid.length > 0) {
    throw new Error(
      `requireRole: unknown role(s): ${invalid.join(", ")}. ` +
        `Valid roles are: ${VALID_ROLES.join(", ")}.`
    );
  }

  if (allowedRoles.length === 0) {
    throw new Error("requireRole: at least one role must be specified.");
  }

  // The actual middleware function returned to Express
  return function roleGuard(req, res, next) {
    // 1. req.user must exist — authMiddleware must have run first.
    //    If someone wires requireRole without authenticate, fail safely.
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Authentication required.",
      });
    }

    // 2. Role must come from the verified JWT via req.user — never from
    //    req.body, req.query, or req.headers directly.
    const userRole = req.user.role;

    // 3. Check the authenticated role against the allowed set.
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to access this resource.",
      });
    }

    return next();
  };
}

module.exports = { requireRole };
