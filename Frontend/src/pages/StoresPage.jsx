// src/pages/StoresPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/AppNavbar";
import StarRating from "../components/StarRating";

const StoresPage = () => {
  const { isLoggedIn, role, user } = useAuth();
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/stores");
        const storeList = response.data?.data?.stores || [];
        setStores(storeList);

        if (isLoggedIn && role === "USER") {
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
                // Ignore individual rating fetch failures
              }
            })
          );
          setUserRatings(ratingsMap);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load stores. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [isLoggedIn, role, user?.id]);

  const filteredStores = useMemo(() => {
    if (!search.trim()) return stores;
    const query = search.toLowerCase();
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
    );
  }, [stores, search]);

  return (
    <div className="min-h-screen flex flex-col bg-neo-bg bg-grid-pattern text-black">
      <AppNavbar searchValue={search} onSearchChange={setSearch} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-neo-secondary border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-1 mb-2">
              COMMUNITY DIRECTORY
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              Explore Stores
            </h1>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black/70 mt-0.5">
              Read transparent feedback & drop your rating
            </p>
          </div>

          {/* Search Box */}
          <div className="sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH BY NAME OR CITY..."
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider border-4 border-black bg-white text-black placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Global Loading State */}
        {loading && (
          <div className="text-center py-20 font-black text-sm uppercase tracking-widest text-black">
            ⏳ LOADING STORES DIRECTORY...
          </div>
        )}

        {/* Global Error State */}
        {error && (
          <div className="mb-6 p-4 bg-neo-accent border-4 border-black text-white font-bold text-sm uppercase tracking-wider shadow-[6px_6px_0px_0px_#000]">
            ⚠ {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredStores.length === 0 && (
          <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
            <p className="text-lg font-black uppercase tracking-tight text-black mb-1">
              No stores found.
            </p>
            {search ? (
              <p className="text-xs font-bold uppercase tracking-wider text-black/60">
                No stores match "{search}".{" "}
                <button
                  onClick={() => setSearch("")}
                  className="text-black underline font-black hover:bg-neo-secondary px-1"
                >
                  Clear search
                </button>
              </p>
            ) : (
              <p className="text-xs font-bold uppercase tracking-wider text-black/60">
                There are currently no stores registered on the platform.
              </p>
            )}
          </div>
        )}

        {/* Stores Grid */}
        {!loading && !error && filteredStores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => {
              const myRating = userRatings[store.id];

              return (
                <div
                  key={store.id}
                  className="card-neo bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between"
                >
                  <div>
                    {/* Store Title */}
                    <h2 className="text-xl font-black uppercase tracking-tight text-black truncate mb-1">
                      {store.name}
                    </h2>

                    {/* Store Address */}
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
                    {isLoggedIn && role === "USER" && (
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
                    )}
                  </div>

                  {/* Card Action Link */}
                  <div className="mt-6 pt-3 border-t-2 border-black">
                    <Link
                      to={`/stores/${store.id}`}
                      className="w-full btn-neo inline-flex items-center justify-center py-2.5 px-4 bg-white border-2 border-black text-black font-black text-xs uppercase tracking-wider hover:bg-neo-secondary shadow-[3px_3px_0px_0px_#000]"
                    >
                      {isLoggedIn && role === "USER"
                        ? myRating
                          ? "UPDATE YOUR RATING →"
                          : "RATE THIS STORE →"
                        : "VIEW STORE REVIEWS →"}
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

export default StoresPage;
