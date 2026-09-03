// src/pages/StoreDetailsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/AppNavbar";
import StarRating from "../components/StarRating";

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
      const data = response.data?.data || {};

      setStore(data.store);
      const fetchedRatings = data.ratings || [];
      setRatings(fetchedRatings);

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

  const myRating = ratings.find((r) => r.user?.id === user?.id);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setActionError("");
    setSubmitting(true);

    try {
      if (myRating) {
        const response = await api.put(`/ratings/${myRating.id}`, {
          value: Number(ratingValue),
        });
        setActionMessage(
          response.data?.message || "Rating updated successfully!"
        );
      } else {
        const response = await api.post("/ratings", {
          storeId: id,
          value: Number(ratingValue),
        });
        setActionMessage(
          response.data?.message || "Rating submitted successfully!"
        );
      }

      await fetchStoreData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to save rating. Please try again.";
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neo-bg bg-grid-pattern text-black">
        <AppNavbar />
        <div className="text-center py-24 font-black text-sm uppercase tracking-widest text-black">
          ⏳ LOADING STORE DETAILS...
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col bg-neo-bg bg-grid-pattern text-black">
        <AppNavbar />
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-12">
          <div className="p-5 bg-neo-accent border-4 border-black text-white font-bold text-sm uppercase tracking-wider shadow-[6px_6px_0px_0px_#000] mb-6">
            ⚠ {error || "Store not found."}
          </div>
          <Link
            to="/stores"
            className="btn-neo inline-block px-4 py-2 bg-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]"
          >
            ← BACK TO STORES
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neo-bg bg-grid-pattern text-black">
      <AppNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-10">
        {/* Back Link */}
        <Link
          to="/stores"
          className="btn-neo inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-neo-secondary mb-8"
        >
          <span>←</span>
          <span>BACK TO STORES</span>
        </Link>

        {/* Store Info Card */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="inline-block px-2.5 py-0.5 bg-neo-muted border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-1 mb-2">
                VERIFIED BUSINESS
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mb-2">
                {store.name}
              </h1>
              <p className="text-sm font-bold text-black/80 mb-1">
                📍 {store.address}
              </p>
              <p className="text-sm font-bold text-black/60">
                ✉️ {store.email}
              </p>
            </div>

            {/* Score Highlight Box */}
            <div className="bg-neo-secondary border-4 border-black p-5 text-center sm:min-w-[170px] shadow-[4px_4px_0px_0px_#000] rotate-1">
              <div className="text-[11px] font-black uppercase tracking-widest text-black/70 mb-1">
                COMMUNITY SCORE
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-black text-3xl font-black">★</span>
                <span className="text-3xl font-black text-black tabular-nums">
                  {store.averageRating !== null ? Number(store.averageRating).toFixed(1) : "—"}
                </span>
              </div>
              <div className="text-xs font-black uppercase tracking-wider text-black mt-1 tabular-nums">
                {store.ratingCount} {store.ratingCount === 1 ? "RATING" : "RATINGS"}
              </div>
            </div>
          </div>
        </div>

        {/* User Interactive Rating Card */}
        {isLoggedIn && role === "USER" && (
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] mb-8">
            <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-3">
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                {myRating ? "Your Rating & Feedback" : "Leave Your Rating"}
              </h2>
              {myRating && (
                <span className="px-3 py-1 bg-neo-secondary border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] rotate-2">
                  CURRENT: {myRating.value} / 5 ★
                </span>
              )}
            </div>

            {actionMessage && (
              <div className="mb-4 p-3 bg-neo-secondary border-3 border-black text-black font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
                ✓ {actionMessage}
              </div>
            )}

            {actionError && (
              <div className="mb-4 p-3 bg-neo-accent border-3 border-black text-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
                ⚠ {actionError}
              </div>
            )}

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                  Click to select score (1 to 5 stars):
                </label>
                <StarRating
                  interactive
                  value={ratingValue}
                  onChange={(val) => setRatingValue(val)}
                  disabled={submitting}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-neo px-6 py-3 bg-neo-accent text-white font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] focus:outline-none disabled:opacity-40"
                >
                  {submitting
                    ? "SAVING RATING..."
                    : myRating
                    ? "UPDATE MY RATING ★"
                    : "SUBMIT MY RATING ★"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Customer Reviews Feed */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Customer Ratings
            </h2>
            <span className="px-2.5 py-0.5 bg-neo-bg border-2 border-black font-black text-xs uppercase tracking-wider tabular-nums shadow-[2px_2px_0px_0px_#000]">
              {ratings.length} TOTAL
            </span>
          </div>

          {ratings.length === 0 ? (
            <div className="text-center py-8 font-bold text-xs uppercase tracking-wider text-black/50">
              No ratings submitted yet. Be the first to rate!
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => {
                const isMe = r.user?.id === user?.id;

                return (
                  <div
                    key={r.id}
                    className={`p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] ${
                      isMe ? "bg-neo-secondary/30" : "bg-neo-bg"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm uppercase tracking-wide text-black">
                          {r.user?.name || "Customer"}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 bg-neo-secondary border-2 border-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase text-black/60">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <StarRating value={r.value} showValue={false} size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoreDetailsPage;
