// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/AppNavbar";

const HomePage = () => {
  const { isLoggedIn, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-neo-bg text-black bg-grid-pattern">
      <AppNavbar />

      {/* Marquee Banner */}
      <div className="w-full bg-neo-secondary border-b-4 border-black py-2.5 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-pulse font-black text-xs sm:text-sm uppercase tracking-widest text-black">
          ⚡ 100% AUTHENTIC COMMUNITY REVIEWS • 🏪 VERIFIED STORE OWNERS • 🛡️ SYSTEM ADMINISTRATOR CONTROLS • ⚡ 100% AUTHENTIC COMMUNITY REVIEWS • 🏪 VERIFIED STORE OWNERS • 🛡️ SYSTEM ADMINISTRATOR CONTROLS •
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Top Tag Sticker */}
        <div className="inline-block px-4 py-1.5 bg-neo-muted border-4 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] -rotate-2 mb-8">
          ★ RAW, UNFILTERED & TRANSPARENT RATINGS
        </div>

        {/* Hero Title with Outlined Stroke & Color Stickers */}
        <div className="max-w-4xl mb-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.95]">
            <span>RATE LOCAL STORES. </span>
            <span className="inline-block bg-neo-secondary border-4 border-black px-3 py-1 shadow-[6px_6px_0px_0px_#000] rotate-1 my-1">
              SHARE TRUTH.
            </span>
            <br className="hidden sm:inline" />
            <span className="inline-block bg-neo-accent text-white border-4 border-black px-3 py-1 shadow-[6px_6px_0px_0px_#000] -rotate-1 my-1">
              ZERO NOISE.
            </span>
          </h1>
        </div>

        <p className="text-base sm:text-xl font-bold max-w-2xl text-black/80 mt-4 leading-relaxed">
          The unapologetic rating system for consumers, store owners, and platform administrators. No fake reviews. No algorithm games.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/stores"
            className="btn-neo px-6 py-3.5 bg-neo-accent text-white font-black text-sm uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:bg-neo-accent"
          >
            BROWSE STORES NOW →
          </Link>
          {!isLoggedIn ? (
            <Link
              to="/register"
              className="btn-neo px-6 py-3.5 bg-neo-secondary text-black font-black text-sm uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:bg-neo-secondary"
            >
              CREATE FREE ACCOUNT ★
            </Link>
          ) : (
            <Link
              to={
                role === "ADMIN"
                  ? "/admin"
                  : role === "STORE_OWNER"
                  ? "/owner"
                  : "/dashboard"
              }
              className="btn-neo px-6 py-3.5 bg-white text-black font-black text-sm uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:bg-neo-muted"
            >
              GO TO MY DASHBOARD →
            </Link>
          )}
        </div>

        {/* 3 Pillar Cards (60/40 visual balance & asymmetric stickers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 sm:mt-24 w-full text-left">
          {/* Consumer Box */}
          <div className="card-neo bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between relative">
            <div className="absolute -top-4 -right-2 px-3 py-1 bg-neo-secondary border-2 border-black font-black text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] rotate-3">
              FOR USERS
            </div>
            <div>
              <div className="w-12 h-12 bg-neo-secondary border-3 border-black font-black text-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] mb-5">
                🛍️
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-black mb-2">
                Rate & Review
              </h2>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                Discover registered stores, read feedback from real customers, and submit your 1 to 5 star rating.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-black">
              <Link
                to="/stores"
                className="font-black text-xs uppercase tracking-wider text-black hover:text-neo-accent transition-colors flex items-center gap-1"
              >
                BROWSE STORES <span>→</span>
              </Link>
            </div>
          </div>

          {/* Store Owner Box */}
          <div className="card-neo bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between relative">
            <div className="absolute -top-4 -right-2 px-3 py-1 bg-neo-muted border-2 border-black font-black text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] -rotate-2">
              FOR OWNERS
            </div>
            <div>
              <div className="w-12 h-12 bg-neo-muted border-3 border-black font-black text-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] mb-5">
                🏪
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-black mb-2">
                Own Your Score
              </h2>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                Check aggregate ratings in real time, monitor customer feedback, and update your business profile.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-black">
              <Link
                to={role === "STORE_OWNER" ? "/owner" : "/login"}
                className="font-black text-xs uppercase tracking-wider text-black hover:text-neo-accent transition-colors flex items-center gap-1"
              >
                OWNER PORTAL <span>→</span>
              </Link>
            </div>
          </div>

          {/* Admin Box */}
          <div className="card-neo bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between relative">
            <div className="absolute -top-4 -right-2 px-3 py-1 bg-neo-accent text-white border-2 border-black font-black text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] rotate-2">
              FOR ADMINS
            </div>
            <div>
              <div className="w-12 h-12 bg-neo-accent text-white border-3 border-black font-black text-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] mb-5">
                ⚡
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-black mb-2">
                Command Center
              </h2>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                Dense, table-first overview with live search, role assignments, store moderation, and platform statistics.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-black">
              <Link
                to={role === "ADMIN" ? "/admin" : "/login"}
                className="font-black text-xs uppercase tracking-wider text-black hover:text-neo-accent transition-colors flex items-center gap-1"
              >
                ADMIN STATION <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t-4 border-black bg-white py-8 text-center text-xs font-black uppercase tracking-widest">
        ★ StoreRatings • Built with raw Neo-brutalist principles • 2026
      </footer>
    </div>
  );
};

export default HomePage;
