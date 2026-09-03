// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Guard
 * - If not logged in -> redirects to /login
 * - If logged in, but role is not allowed -> redirects to / (or fallback route)
 * - If authorized -> renders child component
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, role } = useAuth();

  // 1. Not authenticated -> Redirect to /login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role restriction specified, but user's role does not match -> Redirect to Home
  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
