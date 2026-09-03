// src/pages/AdminStoresPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // Edit Store State
  const [editingStore, setEditingStore] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/stores");
      setStores(response.data?.data?.stores || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load stores. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleStartEdit = (store) => {
    setEditingStore(store);
    setEditName(store.name);
    setEditEmail(store.email);
    setEditAddress(store.address);
    setActionMessage("");
    setActionError("");
  };

  const handleCancelEdit = () => {
    setEditingStore(null);
    setActionError("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setActionError("");
    setSaving(true);

    try {
      const response = await api.put(`/stores/${editingStore.id}`, {
        name: editName.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
      });

      setActionMessage(response.data?.message || "Store updated successfully!");
      setEditingStore(null);
      await fetchStores();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update store. Please try again.";
      setActionError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStore = async (storeToDelete) => {
    setActionMessage("");
    setActionError("");

    const confirmed = window.confirm(
      `Are you sure you want to delete "${storeToDelete.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(`/stores/${storeToDelete.id}`);
      setActionMessage(
        response.data?.message || `Store "${storeToDelete.name}" deleted successfully.`
      );
      await fetchStores();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete store. Please try again.";
      setActionError(errorMsg);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem" }}>
      {/* Navigation Link */}
      <Link
        to="/admin"
        style={{
          display: "inline-block",
          marginBottom: "1rem",
          fontSize: "0.9rem",
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        ← Back to Admin Dashboard
      </Link>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "1.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", color: "#0f172a", marginBottom: "0.25rem" }}>
              Store Management
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Total stores: {stores.length}
            </p>
          </div>
        </div>

        {/* Global Success / Error Messages */}
        {actionMessage && (
          <div style={{ padding: "0.85rem 1rem", marginBottom: "1.25rem", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "6px" }}>
            {actionMessage}
          </div>
        )}

        {actionError && (
          <div style={{ padding: "0.85rem 1rem", marginBottom: "1.25rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px" }}>
            {actionError}
          </div>
        )}

        {/* Edit Store Form */}
        {editingStore && (
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.75rem",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "1rem" }}>
              Edit Store: <span style={{ color: "#7c3aed" }}>{editingStore.name}</span>
            </h2>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "500", fontSize: "0.9rem" }}>
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

                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "500", fontSize: "0.9rem" }}>
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
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "500", fontSize: "0.9rem" }}>
                  Store Address
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
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
                    padding: "0.5rem 1.25rem",
                    backgroundColor: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "600",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{
                    padding: "0.5rem 1.25rem",
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
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
            Loading stores list...
          </div>
        )}

        {error && (
          <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        {!loading && !error && stores.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
            No stores found.
          </div>
        )}

        {!loading && !error && stores.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {stores.map((s) => (
              <div
                key={s.id}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "0.4rem", fontWeight: "600" }}>
                    {s.name}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>
                    {s.email}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "0.75rem" }}>
                    {s.address}
                  </p>

                  <div style={{ marginBottom: "1.25rem" }}>
                    {s.averageRating !== null ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#d97706" }}>
                          ⭐ {s.averageRating}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          ({s.ratingCount} {s.ratingCount === 1 ? "rating" : "ratings"})
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "1.05rem", color: "#64748b" }}>
                          ⭐ 0
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          (0 ratings)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.85rem", display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleStartEdit(s)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      backgroundColor: "#f1f5f9",
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStore(s)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fecaca",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStoresPage;

