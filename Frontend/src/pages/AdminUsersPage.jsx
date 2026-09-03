// src/pages/AdminUsersPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import RoleBadge from "../components/RoleBadge";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // Filter Row State
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  // Edit User Modal State
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
      `Are you sure you want to delete user "${userToDelete.name}" (${userToDelete.email})?`
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

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesName =
        !searchName.trim() ||
        u.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesEmail =
        !searchEmail.trim() ||
        u.email.toLowerCase().includes(searchEmail.toLowerCase());
      const matchesAddress =
        !searchAddress.trim() ||
        (u.address && u.address.toLowerCase().includes(searchAddress.toLowerCase()));
      const matchesRole =
        filterRole === "ALL" || u.role === filterRole;

      return matchesName && matchesEmail && matchesAddress && matchesRole;
    });
  }, [users, searchName, searchEmail, searchAddress, filterRole]);

  const hasActiveFilters =
    searchName || searchEmail || searchAddress || filterRole !== "ALL";

  const clearFilters = () => {
    setSearchName("");
    setSearchEmail("");
    setSearchAddress("");
    setFilterRole("ALL");
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-neo-accent text-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-1 mb-2">
            ACCOUNTS CONTROL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            User Management
          </h1>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black/70 mt-0.5">
            Total registered accounts: <span className="font-black tabular-nums">{users.length}</span>
          </p>
        </div>
      </div>

      {/* Global Notifications */}
      {actionMessage && (
        <div className="mb-6 p-4 bg-neo-secondary border-4 border-black text-black font-black text-sm uppercase tracking-wider shadow-[6px_6px_0px_0px_#000]">
          ✓ {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-4 bg-neo-accent border-4 border-black text-white font-bold text-sm uppercase tracking-wider shadow-[6px_6px_0px_0px_#000]">
          ⚠ {actionError}
        </div>
      )}

      {/* Filter Row directly above table */}
      <div className="bg-white border-4 border-black p-5 mb-8 shadow-[6px_6px_0px_0px_#000]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Filter By Name
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="SEARCH NAME..."
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider border-3 border-black bg-neo-bg text-black placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Filter By Email
            </label>
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="SEARCH EMAIL..."
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider border-3 border-black bg-neo-bg text-black placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Filter By Address
            </label>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="SEARCH ADDRESS..."
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider border-3 border-black bg-neo-bg text-black placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Filter By Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider border-3 border-black bg-neo-bg text-black focus:bg-neo-secondary focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none transition-all"
            >
              <option value="ALL">ALL ROLES</option>
              <option value="USER">NORMAL USER</option>
              <option value="STORE_OWNER">STORE OWNER</option>
              <option value="ADMIN">ADMINISTRATOR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {loading && (
          <div className="text-center py-20 font-black text-sm uppercase tracking-widest text-black">
            ⏳ LOADING USERS DIRECTORY...
          </div>
        )}

        {error && (
          <div className="p-6 text-neo-accent font-bold text-sm uppercase">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-lg font-black uppercase tracking-tight text-black mb-1">
              No users match your filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-neo mt-2 px-3 py-1 bg-neo-secondary border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neo-secondary border-b-4 border-black text-xs font-black uppercase tracking-wider text-black">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-sm font-bold bg-white">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neo-bg h-14 transition-colors">
                    <td className="py-3 px-4 font-black uppercase text-black whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-black/80 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 text-black/80 max-w-xs truncate" title={u.address}>
                      {u.address}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 px-4 text-xs font-bold uppercase text-black/60 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="btn-neo px-3 py-1 text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-neo-secondary"
                        >
                          Edit
                        </button>
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn-neo px-3 py-1 text-xs font-black uppercase tracking-wider text-white bg-neo-accent border-2 border-black shadow-[2px_2px_0px_0px_#000]"
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-[500px] w-full p-6 sm:p-8 shadow-[12px_12px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                Edit User Account
              </h2>
              <button
                onClick={handleCancelEdit}
                className="btn-neo px-2 py-1 font-black text-sm uppercase text-black hover:bg-neo-secondary"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-neo-accent border-3 border-black text-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
                ⚠ {actionError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Full Name (20–60 chars)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  disabled={saving}
                  className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  disabled={saving}
                  className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Role
                </label>
                {editingUser.role === "ADMIN" ? (
                  <input
                    type="text"
                    value="ADMIN (System Administrator - Fixed)"
                    disabled
                    className="w-full px-3 py-2 border-4 border-black text-sm font-bold bg-neo-bg text-black/50 cursor-not-allowed uppercase"
                  />
                ) : (
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    disabled={saving}
                    className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
                  >
                    <option value="USER">NORMAL USER</option>
                    <option value="STORE_OWNER">STORE OWNER</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Address
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  required
                  disabled={saving}
                  className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t-4 border-black flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="btn-neo px-4 py-2 bg-white border-2 border-black font-black text-xs uppercase tracking-wider hover:bg-neo-muted shadow-[2px_2px_0px_0px_#000]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-neo px-5 py-2 bg-neo-accent text-white font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] focus:outline-none disabled:opacity-40"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES ★"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
