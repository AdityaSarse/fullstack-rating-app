// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/AppNavbar";
import StarRating from "../components/StarRating";
import RoleBadge from "../components/RoleBadge";

const DashboardPage = () => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        const storeList = storesRes.data?.data?.stores || [];
        setStores(storeList);

        const ratingsMap = {};
        await Promise.all(
          storeList.map(async (st) => {
            try {
              const rRes = await api.get(`/stores/${st.id}/ratings`);
              const myRating = rRes.data?.data?.ratings?.find(
                (r) => r.user?.id === user?.id
              );
              if (myRating) {
                ratingsMap[st.id] = myRating.value;
              }
            } catch (e) {
              // ignore
            }
          })
        );
        setUserRatings(ratingsMap);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const ratedStoresCount = Object.keys(userRatings).length;

  return (
    <div className="min-h-screen flex flex-col bg-neo-bg bg-grid-pattern text-black">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10">
        {/* Welcome Header Banner */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[8px_8px_0px_0px_#000]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                Welcome, {profile?.name || "User"}
              </h1>
              <RoleBadge role="USER" rotate />
            </div>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              {profile?.email} • {profile?.address || "Registered Member"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-neo-secondary border-3 border-black p-3 text-center shadow-[3px_3px_0px_0px_#000] rotate-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-black/70">
                Stores Rated
              </div>
              <div className="text-2xl font-black text-black tabular-nums">
                {ratedStoresCount} / {stores.length}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-neo px-4 py-2.5 bg-neo-accent text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:outline-none"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-3">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Stores Available for Rating
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-black/60 mt-0.5">
              Select any store below to submit or modify your review
            </p>
          </div>
          <Link
            to="/stores"
            className="btn-neo px-3 py-1 bg-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:bg-neo-secondary"
          >
            VIEW ALL →
          </Link>
        </div>

        {/* Global Loading State */}
        {loading && (
          <div className="text-center py-20 font-black text-sm uppercase tracking-widest text-black">
            ⏳ LOADING YOUR DASHBOARD...
          </div>
        )}

        {/* Global Error State */}
        {error && (
          <div className="mb-6 p-4 bg-neo-accent border-4 border-black text-white font-bold text-sm uppercase tracking-wider shadow-[6px_6px_0px_0px_#000]">
            ⚠ {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stores.length === 0 && (
          <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
            <p className="text-lg font-black uppercase tracking-tight text-black mb-1">
              No stores found.
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-black/60">
              There are currently no stores available to rate.
            </p>
          </div>
        )}

        {/* Store Cards Grid */}
        {!loading && !error && stores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const myRating = userRatings[store.id];

              return (
                <div
                  key={store.id}
                  className="card-neo bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-black truncate mb-1">
                      {store.name}
                    </h3>
                    <p className="text-xs font-bold text-black/70 line-clamp-2 mb-4">
                      📍 {store.address}
                    </p>

                    {/* Overall Rating */}
                    <div className="mb-4 p-2.5 bg-neo-bg border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000]">
                      <StarRating
                        value={store.averageRating}
                        count={store.ratingCount}
                        size={16}
                      />
                    </div>

                    {/* User's Own Rating */}
                    <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-black/60">
                        Your rating:
                      </span>
                      {myRating ? (
                        <span className="px-2 py-0.5 bg-neo-secondary border-2 border-black font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                          ★ {myRating} / 5
                        </span>
                      ) : (
                        <span className="font-bold uppercase text-black/40 italic">— Unrated</span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="mt-6 pt-3 border-t-2 border-black">
                    <Link
                      to={`/stores/${store.id}`}
                      className="w-full btn-neo inline-flex items-center justify-center py-2.5 px-4 bg-white border-2 border-black text-black font-black text-xs uppercase tracking-wider hover:bg-neo-secondary shadow-[3px_3px_0px_0px_#000]"
                    >
                      {myRating ? "UPDATE RATING →" : "RATE STORE →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
