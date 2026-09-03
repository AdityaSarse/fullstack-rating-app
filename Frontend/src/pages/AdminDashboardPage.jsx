// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboardPage = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setProfile(response.data?.data?.user);
      } catch (err) {
        console.error("Failed to load admin profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "850px", margin: "2rem auto", padding: "0 1.5rem" }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", color: "#0f172a", marginBottom: "0.25rem" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            {profile?.name ? `Welcome, ${profile.name} • ` : "Welcome, Administrator • "}
            Role: <span style={{ fontWeight: "600", color: "#7c3aed" }}>{role || "ADMIN"}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Admin Action Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Manage Users Card */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👥</div>
            <h2 style={{ fontSize: "1.3rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              Manage Users
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              View all registered users, inspect details, update roles, and manage accounts.
            </p>
          </div>

          <Link
            to="/admin/users"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.75rem 1.25rem",
              backgroundColor: "#2563eb",
              color: "#fff",
              borderRadius: "4px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Manage Users →
          </Link>
        </div>

        {/* Manage Stores Card */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏪</div>
            <h2 style={{ fontSize: "1.3rem", color: "#0f172a", marginBottom: "0.5rem" }}>
              Manage Stores
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Create stores for owners, view all registered stores, edit details, and inspect ratings.
            </p>
          </div>

          <Link
            to="/admin/stores"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.75rem 1.25rem",
              backgroundColor: "#7c3aed",
              color: "#fff",
              borderRadius: "4px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Manage Stores →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
