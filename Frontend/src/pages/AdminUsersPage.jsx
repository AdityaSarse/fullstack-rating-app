// src/pages/AdminUsersPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      setUsers(response.data?.data?.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStartEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditAddress(user.address);
    setEditRole(user.role);
    setActionMessage("");
    setActionError("");
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setActionError("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setActionError("");
    setSaving(true);

    try {
      const payload = {
        name: editName.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
      };

      // Only include role if it's USER or STORE_OWNER (admin role can't be created via update)
      if (editRole !== editingUser.role) {
        payload.role = editRole;
      }

      const response = await api.put(`/users/${editingUser.id}`, payload);
      setActionMessage(response.data?.message || "User updated successfully!");
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update user. Please try again.";
      setActionError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    setActionMessage("");
    setActionError("");

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userToDelete.name}" (${userToDelete.email})?\n\nThis will permanently delete the user and any associated records.`
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(`/users/${userToDelete.id}`);
      setActionMessage(
        response.data?.message || `User "${userToDelete.name}" deleted successfully.`
      );
      await fetchUsers();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete user. Please try again.";
      setActionError(errorMsg);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "ADMIN":
        return { backgroundColor: "#f3e8ff", color: "#7e22ce", border: "1px solid #d8b4fe" };
      case "STORE_OWNER":
        return { backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" };
      case "USER":
      default:
        return { backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" };
    }
  };

  return (
    <div style={{ maxWidth: "1050px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <Link to="/admin" style={{ display: "inline-block", marginBottom: "1rem", fontSize: "0.9rem" }}>
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
              User Management
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Total registered users: {users.length}
            </p>
          </div>
        </div>

        {/* Global Notifications */}
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

        {/* Edit User Modal / Form */}
        {editingUser && (
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
              Edit User: <span style={{ color: "#2563eb" }}>{editingUser.name}</span>
            </h2>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "500", fontSize: "0.9rem" }}>
                    Full Name (20–60 characters)
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
                    Email Address
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

                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "500", fontSize: "0.9rem" }}>
                    User Role
                  </label>
                  {editingUser.role === "ADMIN" ? (
                    <input
                      type="text"
                      value="ADMIN (Role cannot be changed)"
                      disabled
                      style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#64748b" }}
                    />
                  ) : (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      disabled={saving}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "#fff" }}
                    >
                      <option value="USER">USER</option>
                      <option value="STORE_OWNER">STORE_OWNER</option>
                    </select>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "500", fontSize: "0.9rem" }}>
                  Address
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
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "600",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save User"}
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
            Loading users list...
          </div>
        )}

        {error && (
          <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
            No users found.
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#475569" }}>Name</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#475569" }}>Email</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#475569" }}>Role</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#475569" }}>Registered</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#475569", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: "500", color: "#0f172a" }}>
                      {u.name}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#334155" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          ...getRoleBadgeStyle(u.role),
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b", fontSize: "0.85rem" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleStartEdit(u)}
                          style={{
                            padding: "0.35rem 0.75rem",
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
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            style={{
                              padding: "0.35rem 0.75rem",
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
