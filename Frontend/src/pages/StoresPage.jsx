// src/pages/StoresPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/stores");
        setStores(response.data.data.stores || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load stores. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2>Browse Stores</h2>
        <p style={{ color: "#64748b" }}>Discover and rate registered stores</p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
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
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
          No stores found.
        </div>
      )}

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

export default StoresPage;
