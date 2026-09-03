// src/pages/StoreDetailsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StoreDetailsPage = () => {
  const { id } = useParams();
  const { isLoggedIn, role, user } = useAuth();

  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rating form state
  const [ratingValue, setRatingValue] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchStoreData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/stores/${id}/ratings`);
      const data = response.data.data;

      setStore(data.store);
      const fetchedRatings = data.ratings || [];
      setRatings(fetchedRatings);

      // If user has an existing rating, prefill the selector with their value
      const existingUserRating = fetchedRatings.find(
        (r) => r.user?.id === user?.id
      );
      if (existingUserRating) {
        setRatingValue(existingUserRating.value);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load store details."
      );
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Check if current authenticated user has already rated this store
  const myRating = ratings.find((r) => r.user?.id === user?.id);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setActionError("");
    setSubmitting(true);

    try {
      if (myRating) {
        // UPDATE existing rating: PUT /api/ratings/:id
        const response = await api.put(`/ratings/${myRating.id}`, {
          value: Number(ratingValue),
        });
        setActionMessage(
          response.data.message || "Rating updated successfully!"
        );
      } else {
        // CREATE new rating: POST /api/ratings
        const response = await api.post("/ratings", {
          storeId: id,
          value: Number(ratingValue),
        });
        setActionMessage(
          response.data.message || "Rating submitted successfully!"
        );
      }

      // Refresh store & ratings to reflect updated average and review list
      await fetchStoreData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to save rating. Please try again.";
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
        Loading store details...
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ maxWidth: "750px", margin: "2rem auto", padding: "1.5rem" }}>
        <div style={{ padding: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px" }}>
          {error || "Store not found."}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <Link to="/stores">← Back to Stores</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "750px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <Link to="/stores" style={{ display: "inline-block", marginBottom: "1rem", fontSize: "0.9rem" }}>
        ← Back to Stores
      </Link>

      {/* Store Header Card */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", color: "#0f172a", marginBottom: "0.5rem" }}>
          {store.name}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.75rem" }}>
          {store.averageRating !== null ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#d97706" }}>
                ⭐ {store.averageRating}
              </span>
              <span style={{ color: "#64748b" }}>
                ({store.ratingCount} {store.ratingCount === 1 ? "rating" : "ratings"})
              </span>
            </div>
          ) : (
            <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
              No ratings yet
            </span>
          )}
        </div>
      </div>

      {/* Rating Management Box (USER role only) */}
      {isLoggedIn && role === "USER" && (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#0f172a" }}>
              {myRating ? "Your Rating" : "Submit Your Rating"}
            </h3>
            {myRating && (
              <span style={{ fontSize: "0.9rem", color: "#166534", backgroundColor: "#dcfce7", padding: "0.2rem 0.6rem", borderRadius: "4px", fontWeight: "500" }}>
                Rated: {"⭐".repeat(myRating.value)} ({myRating.value}/5)
              </span>
            )}
          </div>

          {actionMessage && (
            <div style={{ padding: "0.75rem", marginBottom: "1rem", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "4px" }}>
              {actionMessage}
            </div>
          )}

          {actionError && (
            <div style={{ padding: "0.75rem", marginBottom: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "4px" }}>
              {actionError}
            </div>
          )}

          <form onSubmit={handleRatingSubmit} style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <label style={{ fontWeight: "500" }}>
              {myRating ? "Change Rating:" : "Select Rating:"}
            </label>
            <select
              value={ratingValue}
              onChange={(e) => setRatingValue(Number(e.target.value))}
              disabled={submitting}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                fontSize: "1rem",
                backgroundColor: "#fff",
              }}
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
              <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
              <option value={3}>⭐⭐⭐ (3 - Good)</option>
              <option value={2}>⭐⭐ (2 - Fair)</option>
              <option value={1}>⭐ (1 - Poor)</option>
            </select>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.5rem 1.25rem",
                backgroundColor: myRating ? "#0284c7" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? "Saving..."
                : myRating
                ? "Update Rating"
                : "Submit Rating"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews & Ratings List */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          User Ratings ({ratings.length})
        </h3>

        {ratings.length === 0 ? (
          <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No ratings submitted yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ratings.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: "1rem",
                  border: "1px solid #f1f5f9",
                  borderRadius: "6px",
                  backgroundColor: r.user?.id === user?.id ? "#f0f9ff" : "#f8fafc",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>
                    {r.user?.name || "Anonymous User"}
                    {r.user?.id === user?.id && (
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                        You
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ color: "#d97706", fontSize: "1rem" }}>
                  {"⭐".repeat(r.value)} <span style={{ color: "#64748b", fontSize: "0.85rem" }}>({r.value}/5)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailsPage;
