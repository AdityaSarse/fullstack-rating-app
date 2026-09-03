// src/pages/AdminStoresPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import StarRating from "../components/StarRating";

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // Filter Row State
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

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
      `Are you sure you want to delete store "${storeToDelete.name}"?`
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

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchesName =
        !searchName.trim() ||
        s.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesEmail =
        !searchEmail.trim() ||
        s.email.toLowerCase().includes(searchEmail.toLowerCase());
      const matchesAddress =
        !searchAddress.trim() ||
        (s.address && s.address.toLowerCase().includes(searchAddress.toLowerCase()));

      return matchesName && matchesEmail && matchesAddress;
    });
  }, [stores, searchName, searchEmail, searchAddress]);

  const hasActiveFilters = searchName || searchEmail || searchAddress;

  const clearFilters = () => {
    setSearchName("");
    setSearchEmail("");
    setSearchAddress("");
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-neo-secondary border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-1 mb-2">
            STORES CONTROL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Store Management
          </h1>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black/70 mt-0.5">
            Total registered business stores: <span className="font-black tabular-nums">{stores.length}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Filter By Store Name
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="SEARCH STORE NAME..."
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
              placeholder="SEARCH ADDRESS/CITY..."
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider border-3 border-black bg-neo-bg text-black placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {loading && (
          <div className="text-center py-20 font-black text-sm uppercase tracking-widest text-black">
            ⏳ LOADING STORES DIRECTORY...
          </div>
        )}

        {error && (
          <div className="p-6 text-neo-accent font-bold text-sm uppercase">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && filteredStores.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-lg font-black uppercase tracking-tight text-black mb-1">
              No stores match your filters.
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

        {!loading && !error && filteredStores.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neo-secondary border-b-4 border-black text-xs font-black uppercase tracking-wider text-black">
                  <th className="py-3.5 px-4">Store Name</th>
                  <th className="py-3.5 px-4">Contact Email</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Rating Summary</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-sm font-bold bg-white">
                {filteredStores.map((s) => (
                  <tr key={s.id} className="hover:bg-neo-bg h-14 transition-colors">
                    <td className="py-3 px-4 font-black uppercase text-black whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-black/80 whitespace-nowrap">
                      {s.email}
                    </td>
                    <td className="py-3 px-4 text-black/80 max-w-xs truncate" title={s.address}>
                      {s.address}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StarRating
                        value={s.averageRating}
                        count={s.ratingCount}
                        size={16}
                      />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/stores/${s.id}`}
                          className="btn-neo px-3 py-1 text-xs font-black uppercase tracking-wider text-black bg-neo-bg border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-neo-muted"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleStartEdit(s)}
                          className="btn-neo px-3 py-1 text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-neo-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStore(s)}
                          className="btn-neo px-3 py-1 text-xs font-black uppercase tracking-wider text-white bg-neo-accent border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Store Modal */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-[500px] w-full p-6 sm:p-8 shadow-[12px_12px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                Edit Store: {editingStore.name}
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
                  Store Name
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
                  Store Email
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
                  Store Address
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
                  {saving ? "SAVING..." : "SAVE STORE ★"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStoresPage;
