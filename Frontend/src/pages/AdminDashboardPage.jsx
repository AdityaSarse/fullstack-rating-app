// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import RoleBadge from "../components/RoleBadge";

const AdminDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [storeCount, setStoreCount] = useState(0);
  const [totalRatingsCount, setTotalRatingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const [meRes, usersRes, storesRes] = await Promise.all([
          api.get("/auth/me").catch(() => ({ data: { data: { user: null } } })),
          api.get("/users").catch(() => ({ data: { data: { users: [] } } })),
          api.get("/stores").catch(() => ({ data: { data: { stores: [] } } })),
        ]);

        if (meRes.data?.data?.user) {
          setProfile(meRes.data.data.user);
        }

        const usersList = usersRes.data?.data?.users || [];
        const storesList = storesRes.data?.data?.stores || [];

        setUserCount(usersList.length);
        setStoreCount(storesList.length);

        const ratingsTotal = storesList.reduce(
          (acc, curr) => acc + (curr.ratingCount || 0),
          0
        );
        setTotalRatingsCount(ratingsTotal);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-neo-muted border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-1 mb-2">
            ADMINISTRATION CONTROL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Platform Metrics
          </h1>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black/70 mt-0.5">
            {profile?.name ? `Signed in as ${profile.name} • ` : ""}
            System overview & real-time scale
          </p>
        </div>
        <div>
          <RoleBadge role="ADMIN" rotate />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-black text-sm uppercase tracking-widest text-black">
          ⏳ LOADING DASHBOARD METRICS...
        </div>
      ) : (
        <div className="space-y-8">
          {/* 3 Color-Blocked Big Number Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Users Stat Card */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between overflow-hidden">
              <div className="bg-neo-accent text-white border-b-4 border-black p-3 font-black text-xs uppercase tracking-widest flex items-center justify-between">
                <span>TOTAL REGISTERED USERS</span>
                <span>👥</span>
              </div>
              <div className="p-6">
                <div className="text-4xl sm:text-5xl font-black text-black tabular-nums">
                  {userCount}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-black/60 mt-1">
                  Active Member Accounts
                </div>
              </div>
              <div className="p-4 bg-neo-bg border-t-2 border-black">
                <Link
                  to="/admin/users"
                  className="btn-neo w-full inline-flex items-center justify-center py-2 px-3 bg-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:bg-neo-secondary"
                >
                  MANAGE USERS →
                </Link>
              </div>
            </div>

            {/* Stores Stat Card */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between overflow-hidden">
              <div className="bg-neo-secondary text-black border-b-4 border-black p-3 font-black text-xs uppercase tracking-widest flex items-center justify-between">
                <span>REGISTERED STORES</span>
                <span>🏪</span>
              </div>
              <div className="p-6">
                <div className="text-4xl sm:text-5xl font-black text-black tabular-nums">
                  {storeCount}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-black/60 mt-1">
                  Active Business Stores
                </div>
              </div>
              <div className="p-4 bg-neo-bg border-t-2 border-black">
                <Link
                  to="/admin/stores"
                  className="btn-neo w-full inline-flex items-center justify-center py-2 px-3 bg-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:bg-neo-secondary"
                >
                  MANAGE STORES →
                </Link>
              </div>
            </div>

            {/* Ratings Stat Card */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between overflow-hidden">
              <div className="bg-neo-muted text-black border-b-4 border-black p-3 font-black text-xs uppercase tracking-widest flex items-center justify-between">
                <span>TOTAL RATINGS LOGGED</span>
                <span>★</span>
              </div>
              <div className="p-6">
                <div className="text-4xl sm:text-5xl font-black text-black tabular-nums">
                  {totalRatingsCount}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-black/60 mt-1">
                  Community Feedback Records
                </div>
              </div>
              <div className="p-4 bg-neo-bg border-t-2 border-black flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">VERIFIED REVIEWS</span>
                <span className="text-xs font-black text-success">100% ONLINE</span>
              </div>
            </div>
          </div>

          {/* Quick Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-black mb-2">
                  User Permissions & Accounts
                </h2>
                <p className="text-xs sm:text-sm font-bold text-black/70 mb-6">
                  Inspect registered users, change roles between User and Store Owner, update addresses, or delete accounts.
                </p>
              </div>
              <Link
                to="/admin/users"
                className="btn-neo w-fit inline-flex items-center py-2.5 px-5 bg-neo-secondary text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000]"
              >
                OPEN USERS TABLE →
              </Link>
            </div>

            <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-black mb-2">
                  Store Moderation & Listings
                </h2>
                <p className="text-xs sm:text-sm font-bold text-black/70 mb-6">
                  Review all business entries, update contact and address information, or delete stores and associated records.
                </p>
              </div>
              <Link
                to="/admin/stores"
                className="btn-neo w-fit inline-flex items-center py-2.5 px-5 bg-neo-muted text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000]"
              >
                OPEN STORES TABLE →
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
