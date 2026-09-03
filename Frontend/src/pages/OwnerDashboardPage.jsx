// src/pages/OwnerDashboardPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const OwnerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [ownerStore, setOwnerStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit store state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [meRes, storesRes] = await Promise.all([
        api.get("/auth/me").catch(() => ({ data: { data: { user: null } } })),
        api.get("/stores"),
      ]);

      if (meRes.data?.data?.user) {
        setProfile(meRes.data.data.user);
      }

      const allStores = storesRes.data?.data?.stores || [];
      const myStore = allStores.find((s) => s.ownerId === user?.id);

      if (myStore) {
        setOwnerStore(myStore);
        setEditName(myStore.name);
        setEditEmail(myStore.email);
        setEditAddress(myStore.address);

        // Fetch detailed customer ratings list for this store
        try {
          const ratingsRes = await api.get(`/stores/${myStore.id}/ratings`);
          setStoreRatings(ratingsRes.data?.data?.ratings || []);
        } catch (rErr) {
          console.error("Failed to load store ratings:", rErr);
        }
      } else {
        setOwnerStore(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load store information."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchOwnerData();
    }
  }, [fetchOwnerData, user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStartEdit = () => {
    if (ownerStore) {
      setEditName(ownerStore.name);
      setEditEmail(ownerStore.email);
      setEditAddress(ownerStore.address);
      setSaveSuccess("");
      setSaveError("");
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveSuccess("");
    setSaveError("");
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setSaveSuccess("");
    setSaveError("");

    if (!editName.trim() || !editEmail.trim() || !editAddress.trim()) {
      setSaveError("All fields are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put(`/stores/${ownerStore.id}`, {
        name: editName.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
      });

      setSaveSuccess(response.data.message || "Store updated successfully!");
      setIsEditing(false);
      await fetchOwnerData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update store. Please try again.";
      setSaveError(errorMsg);
    } finally {
      setSaving(false);
    }
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
            Store Owner Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            {profile?.name ? `Owner: ${profile.name} • ` : ""}
            {profile?.email ? `Email: ${profile.email} • ` : ""}
            Role: <span style={{ fontWeight: "600", color: "#0284c7" }}>STORE_OWNER</span>
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

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Loading store details...
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

      {saveSuccess && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: "6px",
          }}
        >
          {saveSuccess}
        </div>
      )}

      {!loading && !error && !ownerStore && (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px dashed #cbd5e1",
            borderRadius: "8px",
            padding: "3rem",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", color: "#334155", marginBottom: "0.5rem" }}>
            No Store Found
          </h3>
          <p>You have not registered or been assigned a store yet.</p>
        </div>
      )}

      {!loading && ownerStore && (
        <div>
          {/* My Store Section */}
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.3rem", color: "#0f172a" }}>My Store</h2>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1.75rem",
              marginBottom: "2rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            {isEditing ? (
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "1.25rem" }}>
                  Edit Store Details
                </h3>

                {saveError && (
                  <div
                    style={{
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "4px",
                    }}
                  >
                    {saveError}
                  </div>
                )}

                <form onSubmit={handleSaveStore}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "500" }}>
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "500" }}>
                      Store Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "500" }}>
                      Store Address
                    </label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      rows={3}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "4px", resize: "vertical" }}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: "0.6rem 1.25rem",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "600",
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      style={{
                        padding: "0.6rem 1.25rem",
                        backgroundColor: "#94a3b8",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                      {ownerStore.name}
                    </h3>
                    <p style={{ color: "#475569", marginBottom: "0.25rem" }}>
                      ✉️ {ownerStore.email}
                    </p>
                    <p style={{ color: "#475569" }}>
                      📍 {ownerStore.address}
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      padding: "1rem 1.5rem",
                      borderRadius: "8px",
                      textAlign: "center",
                      minWidth: "160px",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
                      Rating Summary
                    </div>
                    {ownerStore.averageRating !== null ? (
                      <>
                        <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#d97706" }}>
                          ⭐ {ownerStore.averageRating}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          {ownerStore.ratingCount} {ownerStore.ratingCount === 1 ? "rating" : "ratings"}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: "0.95rem", color: "#94a3b8", fontStyle: "italic", marginTop: "0.5rem" }}>
                        No ratings yet
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem", display: "flex", gap: "1rem" }}>
                  <button
                    onClick={handleStartEdit}
                    style={{
                      padding: "0.6rem 1.2rem",
                      backgroundColor: "#0284c7",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Edit Store
                  </button>

                  <Link
                    to={`/stores/${ownerStore.id}`}
                    style={{
                      display: "inline-block",
                      padding: "0.6rem 1.2rem",
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      fontWeight: "500",
                      textDecoration: "none",
                    }}
                  >
                    View Public Page
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Customer Ratings Section */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1.75rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <h2 style={{ fontSize: "1.3rem", color: "#0f172a", marginBottom: "1rem" }}>
              Customer Ratings ({storeRatings.length})
            </h2>

            {storeRatings.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                No customer ratings received yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {storeRatings.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "1rem",
                      border: "1px solid #f1f5f9",
                      borderRadius: "6px",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>
                        {r.user?.name || "Customer"}
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
      )}
    </div>
  );
};

export default OwnerDashboardPage;
