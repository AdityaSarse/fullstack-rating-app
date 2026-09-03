// src/pages/OwnerDashboardPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/AppNavbar";
import StarRating from "../components/StarRating";
import RoleBadge from "../components/RoleBadge";

const OwnerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [ownerStore, setOwnerStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create store state (for owners with no store)
  const [isCreating, setIsCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit store state (for owners with existing store)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [editError, setEditError] = useState("");

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

  // Create store handlers
  const handleStartCreate = () => {
    setCreateName("");
    setCreateEmail(profile?.email || "");
    setCreateAddress(profile?.address || "");
    setCreateError("");
    setActionSuccess("");
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setCreateError("");
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setCreateError("");
    setActionSuccess("");

    if (!createName.trim() || !createEmail.trim() || !createAddress.trim()) {
      setCreateError("All fields (name, email, and address) are required.");
      return;
    }

    setCreating(true);

    try {
      const response = await api.post("/stores", {
        name: createName.trim(),
        email: createEmail.trim(),
        address: createAddress.trim(),
      });

      setActionSuccess(
        response.data?.message || "Store created successfully!"
      );
      setIsCreating(false);
      await fetchOwnerData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to create store. Please check the details and try again.";
      setCreateError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  // Edit store handlers
  const handleStartEdit = () => {
    if (ownerStore) {
      setEditName(ownerStore.name);
      setEditEmail(ownerStore.email);
      setEditAddress(ownerStore.address);
      setActionSuccess("");
      setEditError("");
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError("");
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setActionSuccess("");
    setEditError("");

    if (!editName.trim() || !editEmail.trim() || !editAddress.trim()) {
      setEditError("All fields are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put(`/stores/${ownerStore.id}`, {
        name: editName.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
      });

      setActionSuccess(response.data?.message || "Store updated successfully!");
      setIsEditing(false);
      await fetchOwnerData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update store. Please try again.";
      setEditError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neo-bg bg-grid-pattern text-black">
      <AppNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-10">
        {/* Header Banner */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[8px_8px_0px_0px_#000]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                Store Owner Portal
              </h1>
              <RoleBadge role="STORE_OWNER" rotate />
            </div>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              {profile?.name ? `${profile.name} • ` : ""}
              {profile?.email || ""}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn-neo self-start sm:self-auto px-4 py-2.5 bg-neo-accent text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:outline-none"
          >
            Logout
          </button>
        </div>

        {/* Global Loading State */}
        {loading && (
          <div className="text-center py-20 font-black text-sm uppercase tracking-widest text-black">
            ⏳ LOADING STORE METRICS...
          </div>
        )}

        {/* Global Error State */}
        {error && (
          <div className="mb-6 p-4 bg-neo-accent border-4 border-black text-white font-bold text-sm uppercase tracking-wider shadow-[6px_6px_0px_0px_#000]">
            ⚠ {error}
          </div>
        )}

        {/* Success Alert */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-neo-secondary border-4 border-black text-black font-black text-sm uppercase tracking-wider shadow-[6px_6px_0px_0px_#000]">
            ✓ {actionSuccess}
          </div>
        )}

        {/* Phase 12.5: No Store Flow & Create Store Form */}
        {!loading && !ownerStore && (
          <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000]">
            {!isCreating ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🏪</div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-2">
                  No store found
                </h2>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black/60 max-w-md mx-auto mb-8">
                  Create your store to start receiving ratings.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="btn-neo inline-flex items-center gap-2 px-6 py-3.5 bg-neo-secondary text-black font-black text-xs sm:text-sm uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:bg-neo-secondary"
                >
                  <span>★</span>
                  <span>CREATE STORE</span>
                  <span>→</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
                  <div>
                    <div className="inline-block px-2.5 py-0.5 bg-neo-secondary border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-1 mb-1">
                      FIRST STORE SETUP
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                      Create Your Store
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="btn-neo px-2 py-1 text-xs font-black uppercase text-black hover:bg-neo-secondary"
                  >
                    ✕ Cancel
                  </button>
                </div>

                {createError && (
                  <div className="mb-6 p-3 bg-neo-accent border-3 border-black text-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
                    ⚠ {createError}
                  </div>
                )}

                <form onSubmit={handleCreateStore} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. Apex Electronics & Gadgets"
                      required
                      disabled={creating}
                      className="w-full px-3 py-2.5 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                      Store Email
                    </label>
                    <input
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="e.g. contact@apexstore.com"
                      required
                      disabled={creating}
                      className="w-full px-3 py-2.5 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                      Store Address
                    </label>
                    <textarea
                      value={createAddress}
                      onChange={(e) => setCreateAddress(e.target.value)}
                      placeholder="e.g. Shop 42, Phoenix Mall, Viman Nagar, Pune, Maharashtra"
                      rows={3}
                      required
                      disabled={creating}
                      className="w-full px-3 py-2.5 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t-4 border-black">
                    <button
                      type="submit"
                      disabled={creating}
                      className="btn-neo px-6 py-3 bg-neo-accent text-white font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {creating ? "CREATING STORE..." : "CREATE STORE ★"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCreate}
                      disabled={creating}
                      className="btn-neo px-4 py-2.5 bg-white border-2 border-black font-black text-xs uppercase tracking-wider hover:bg-neo-muted shadow-[2px_2px_0px_0px_#000]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Store Dashboard Content (When store exists) */}
        {!loading && ownerStore && (
          <div className="space-y-8">
            {/* Massive Aggregate Rating Display */}
            <div className="bg-neo-secondary border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_#000] rotate-[-0.5deg]">
              <div className="text-xs font-black uppercase tracking-widest text-black/80 mb-2">
                OVERALL STORE RATING
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-black text-5xl font-black">★</span>
                <span className="text-5xl sm:text-6xl font-black text-black tabular-nums">
                  {ownerStore.averageRating !== null
                    ? Number(ownerStore.averageRating).toFixed(1)
                    : "—"}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-black tabular-nums">
                {ownerStore.averageRating !== null
                  ? `BASED ON ${ownerStore.ratingCount} ${ownerStore.ratingCount === 1 ? "CUSTOMER REVIEW" : "CUSTOMER REVIEWS"}`
                  : "NO RATINGS SUBMITTED YET"}
              </div>
            </div>

            {/* Store Information & Edit Section */}
            <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000]">
              {isEditing ? (
                <div>
                  <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
                    <h2 className="text-xl font-black uppercase tracking-tight text-black">
                      Edit Store Information
                    </h2>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-neo px-2 py-1 text-xs font-black uppercase text-black hover:bg-neo-secondary"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  {editError && (
                    <div className="mb-4 p-3 bg-neo-accent border-3 border-black text-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
                      ⚠ {editError}
                    </div>
                  )}

                  <form onSubmit={handleSaveStore} className="space-y-4">
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
                        rows={3}
                        required
                        disabled={saving}
                        className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-neo px-5 py-2.5 bg-neo-accent text-white font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] focus:outline-none disabled:opacity-40"
                      >
                        {saving ? "SAVING CHANGES..." : "SAVE STORE PROFILE"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="btn-neo px-4 py-2 bg-white border-2 border-black font-black text-xs uppercase tracking-wider hover:bg-neo-muted shadow-[2px_2px_0px_0px_#000]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 bg-neo-muted border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-1 mb-2">
                        STORE PROFILE
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-1">
                        {ownerStore.name}
                      </h2>
                      <p className="text-xs sm:text-sm font-bold text-black/80 mb-0.5">
                        📍 {ownerStore.address}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-black/60">
                        ✉️ {ownerStore.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleStartEdit}
                        className="btn-neo px-4 py-2 bg-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-neo-secondary"
                      >
                        EDIT DETAILS
                      </button>
                      <Link
                        to={`/stores/${ownerStore.id}`}
                        className="btn-neo px-4 py-2 bg-neo-secondary border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]"
                      >
                        VIEW PUBLIC PAGE →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Ratings Table */}
            <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Recent Customer Ratings
                </h2>
                <span className="px-2.5 py-0.5 bg-neo-bg border-2 border-black font-black text-xs uppercase tracking-wider tabular-nums shadow-[2px_2px_0px_0px_#000]">
                  {storeRatings.length} RECEIVED
                </span>
              </div>

              {storeRatings.length === 0 ? (
                <div className="text-center py-8 font-bold text-xs uppercase tracking-wider text-black/50">
                  No customer ratings received yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border-4 border-black">
                    <thead>
                      <tr className="bg-neo-secondary border-b-4 border-black text-xs font-black uppercase tracking-wider text-black">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black text-sm font-bold bg-white">
                      {storeRatings.map((r) => (
                        <tr key={r.id} className="hover:bg-neo-bg h-14 transition-colors">
                          <td className="py-3 px-4 font-black uppercase text-black">
                            {r.user?.name || "Customer"}
                          </td>
                          <td className="py-3 px-4">
                            <StarRating value={r.value} showValue={false} size={16} />
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-bold uppercase text-black/60">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboardPage;
