// src/components/AdminLayout.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "./RoleBadge";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: "📊" },
    { label: "Manage Users", path: "/admin/users", icon: "👥" },
    { label: "Manage Stores", path: "/admin/stores", icon: "🏪" },
  ];

  return (
    <div className="min-h-screen flex bg-neo-bg text-black">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-neo-bg border-b-4 border-black h-16 px-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2 font-black text-base uppercase tracking-wider">
          <span className="px-2 py-0.5 bg-neo-secondary border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            ★
          </span>
          <span>ADMIN PANEL</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-neo p-2 bg-white border-2 border-black font-black shadow-[3px_3px_0px_0px_#000]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? "✕" : "☰ MENU"}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed 240px Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[250px] bg-neo-bg border-r-4 border-black flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Sidebar Logo */}
          <div className="h-20 px-5 border-b-4 border-black flex items-center bg-white">
            <Link
              to="/admin"
              className="w-full flex items-center justify-between font-black text-base uppercase tracking-tighter"
            >
              <div className="px-2.5 py-1 bg-neo-secondary border-2 border-black shadow-[3px_3px_0px_0px_#000] -rotate-1">
                ★ StoreRatings
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-3">
            <div className="px-2 text-xs font-black uppercase tracking-widest text-black/60">
              System Admin
            </div>
            {navItems.map((item) => {
              const isActive =
                item.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-neo-secondary border-4 border-black shadow-[4px_4px_0px_0px_#000] translate-x-1"
                      : "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-neo-muted hover:shadow-[4px_4px_0px_0px_#000]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User & Logout */}
        <div className="p-4 border-t-4 border-black bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-wider">
                Admin Station
              </div>
              <div className="mt-1">
                <RoleBadge role="ADMIN" />
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-neo flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-white bg-neo-accent border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:outline-none"
          >
            <span>⎋</span>
            <span>Exit / Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[250px] pt-16 md:pt-0 min-h-screen bg-grid-pattern">
        <div className="p-4 sm:p-8 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
