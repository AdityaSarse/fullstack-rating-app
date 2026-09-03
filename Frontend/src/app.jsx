import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StoresPage from "./pages/StoresPage";
import StoreDetailsPage from "./pages/StoreDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminStoresPage from "./pages/AdminStoresPage";
import NotFoundPage from "./pages/NotFoundPage";

const NavigationHeader = () => {
  const { isLoggedIn, role, logout } = useAuth();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "#1e293b",
        color: "#fff",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          RatingApp
        </Link>
      </div>
      <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/" style={{ color: "#cbd5e1" }}>Home</Link>
        <Link to="/stores" style={{ color: "#cbd5e1" }}>Stores</Link>

        {/* Role-specific links */}
        {role === "USER" && <Link to="/dashboard" style={{ color: "#cbd5e1" }}>Dashboard</Link>}
        {role === "STORE_OWNER" && <Link to="/owner" style={{ color: "#cbd5e1" }}>Owner Portal</Link>}
        {role === "ADMIN" && <Link to="/admin" style={{ color: "#cbd5e1" }}>Admin Panel</Link>}

        {isLoggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                fontSize: "0.8rem",
                padding: "0.2rem 0.5rem",
                backgroundColor: "#334155",
                borderRadius: "4px",
                color: "#38bdf8",
                fontWeight: "bold",
              }}
            >
              {role}
            </span>
            <button
              onClick={logout}
              style={{
                padding: "0.4rem 0.8rem",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" style={{ color: "#cbd5e1" }}>Login</Link>
            <Link to="/register" style={{ color: "#cbd5e1" }}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavigationHeader />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/stores/:id" element={<StoreDetailsPage />} />

            {/* Role-Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={["STORE_OWNER"]}>
                  <OwnerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stores"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminStoresPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;