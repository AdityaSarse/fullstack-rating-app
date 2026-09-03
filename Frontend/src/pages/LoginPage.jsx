// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data.data;

      login(token);
      setMessage(`Welcome back, ${user.name}!`);

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "STORE_OWNER") {
        navigate("/owner");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please verify your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neo-bg bg-grid-pattern flex flex-col justify-center items-center px-4 py-12">
      {/* Logo Floating Above Card */}
      <Link to="/" className="mb-8 group">
        <div className="px-4 py-2 bg-neo-secondary border-4 border-black font-black text-2xl tracking-tighter uppercase shadow-[6px_6px_0px_0px_#000] -rotate-2 group-hover:rotate-0 transition-all">
          ★ StoreRatings
        </div>
      </Link>

      {/* Centered Brutalist Card */}
      <div className="w-full max-w-md bg-white border-4 border-black p-6 sm:p-8 shadow-[10px_10px_0px_0px_#000]">
        <div className="mb-6 border-b-4 border-black pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Sign In
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-black/60 mt-1">
            Access your account & ratings
          </p>
        </div>

        {message && (
          <div className="mb-5 p-3 bg-neo-secondary border-3 border-black text-black font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 bg-neo-accent border-3 border-black text-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user1@example.com"
              disabled={loading}
              required
              className="w-full px-3 py-2.5 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
              className="w-full px-3 py-2.5 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neo mt-2 py-3 px-4 bg-neo-accent text-white font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "LOGGING IN..." : "ENTER ACCOUNT →"}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t-4 border-black text-center text-xs font-bold uppercase tracking-wider">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-black text-black underline hover:bg-neo-secondary px-1"
          >
            Create account ★
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
