// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch user profile and stores list in parallel
        const [meRes, storesRes] = await Promise.all([
          api.get("/auth/me").catch(() => ({ data: { data: { user: null } } })),
          api.get("/stores"),
        ]);

        if (meRes.data?.data?.user) {
          setProfile(meRes.data.data.user);
        }
        setStores(storesRes.data.data.stores || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
      {/* User Info & Dashboard Header Banner */}
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
            Welcome, {profile?.name || "User"}!
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            {profile?.email ? `Email: ${profile.email} • ` : ""}
            Role: <span style={{ fontWeight: "600", color: "#0284c7" }}>{role}</span>
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

      {/* Stores Section Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", color: "#0f172a" }}>Browse Stores</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Select a store to view details and submit or update your ratings
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Loading stores...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          No stores found.
        </div>
      )}

      {/* Store Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {stores.map((store) => (
          <div
            key={store.id}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                {store.name}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "1rem" }}>
                📍 {store.address}
              </p>

              <div style={{ marginBottom: "1.25rem" }}>
                {store.averageRating !== null ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#d97706" }}>
                      ⭐ {store.averageRating}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      ({store.ratingCount} {store.ratingCount === 1 ? "rating" : "ratings"})
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
                    No ratings yet
                  </span>
                )}
              </div>
            </div>

            <Link
              to={`/stores/${store.id}`}
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.6rem 1rem",
                backgroundColor: "#2563eb",
                color: "#fff",
                borderRadius: "4px",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              View Store
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
