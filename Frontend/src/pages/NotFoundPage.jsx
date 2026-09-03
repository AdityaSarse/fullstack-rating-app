// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neo-bg bg-grid-pattern text-black">
      <AppNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="p-4 bg-neo-secondary border-4 border-black font-black text-4xl uppercase shadow-[6px_6px_0px_0px_#000] -rotate-3 mb-6">
          404 : PAGE NOT FOUND
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-2">
          Lost in the Grid?
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black/60 max-w-sm mb-8">
          The requested route could not be found or has been moved.
        </p>
        <Link
          to="/"
          className="btn-neo px-6 py-3 bg-neo-accent text-white font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
        >
          RETURN TO HOME PAGE →
        </Link>
      </main>
    </div>
  );
};

export default NotFoundPage;
