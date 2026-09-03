// src/components/AppNavbar.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "./RoleBadge";

const AppNavbar = ({ searchValue = "", onSearchChange = null }) => {
  const { isLoggedIn, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStoresPage = location.pathname === "/stores" || location.pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-40 bg-neo-bg border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-black group flex-shrink-0"
        >
          <div className="px-3 py-1.5 bg-neo-secondary border-4 border-black font-black text-xl tracking-tighter uppercase shadow-[4px_4px_0px_0px_#000] -rotate-1 group-hover:rotate-0 group-hover:shadow-[6px_6px_0px_0px_#000] transition-all">
            ★ StoreRatings
          </div>
        </Link>

        {/* Global Search Bar (on store browsing) */}
        {isStoresPage && onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="SEARCH STORES..."
                className="w-full pl-4 pr-4 py-2 text-sm font-bold uppercase tracking-wider rounded-none border-4 border-black bg-white text-black placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/stores"
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              location.pathname === "/stores"
                ? "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                : "border-2 border-transparent hover:border-black hover:bg-neo-secondary hover:shadow-[3px_3px_0px_0px_#000]"
            }`}
          >
            Stores
          </Link>

          {role === "USER" && (
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                location.pathname === "/dashboard"
                  ? "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                  : "border-2 border-transparent hover:border-black hover:bg-neo-secondary hover:shadow-[3px_3px_0px_0px_#000]"
              }`}
            >
              Dashboard
            </Link>
          )}

          {role === "STORE_OWNER" && (
            <Link
              to="/owner"
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                location.pathname === "/owner"
                  ? "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                  : "border-2 border-transparent hover:border-black hover:bg-neo-secondary hover:shadow-[3px_3px_0px_0px_#000]"
              }`}
            >
              Owner Portal
            </Link>
          )}

          {role === "ADMIN" && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                location.pathname.startsWith("/admin")
                  ? "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                  : "border-2 border-transparent hover:border-black hover:bg-neo-secondary hover:shadow-[3px_3px_0px_0px_#000]"
              }`}
            >
              Admin Panel
            </Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-2.5 pl-2 border-l-2 border-black">
              {role && <RoleBadge role={role} short rotate />}
              <button
                onClick={handleLogout}
                className="btn-neo px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white bg-neo-accent border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:outline-none"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link
                to="/login"
                className="btn-neo px-3.5 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-neo-secondary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-neo px-3.5 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider bg-neo-accent text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-neo-accent"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppNavbar;
