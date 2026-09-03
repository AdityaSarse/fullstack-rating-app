// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Live password validation checklist
  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        address: address.trim(),
        role,
      });

      setMessage(
        response.data?.message ||
          "Registration successful! Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setAddress("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        setError(err.response.data.details.join(" "));
      } else {
        setError(
          err.response?.data?.message || "Registration failed. Please review the form requirements."
        );
      }
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
      <div className="w-full max-w-lg bg-white border-4 border-black p-6 sm:p-8 shadow-[10px_10px_0px_0px_#000]">
        <div className="mb-6 border-b-4 border-black pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Create Account
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-black/60 mt-1">
            Join as a Customer or Store Owner
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
              Full Name (20–60 characters)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Johnathan Alexander Doe"
              required
              disabled={loading}
              className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              required
              disabled={loading}
              className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create your password"
              required
              disabled={loading}
              className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
            />

            {/* Live Password Checklist */}
            {password.length > 0 && (
              <div className="mt-2.5 p-3 bg-neo-bg border-3 border-black space-y-1 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                <div className={`flex items-center gap-2 ${hasLength ? "text-success font-black" : "text-black/50"}`}>
                  <span>{hasLength ? "☑" : "☐"}</span>
                  <span>8 to 16 characters</span>
                </div>
                <div className={`flex items-center gap-2 ${hasUppercase ? "text-success font-black" : "text-black/50"}`}>
                  <span>{hasUppercase ? "☑" : "☐"}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 ${hasSpecial ? "text-success font-black" : "text-black/50"}`}>
                  <span>{hasSpecial ? "☑" : "☐"}</span>
                  <span>At least one special character (!@#$%...)</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
              Address (Max 400 chars)
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 MG Road, Pune, Maharashtra"
              rows={2}
              required
              disabled={loading}
              className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border-4 border-black text-sm font-bold text-black bg-white focus:bg-neo-secondary focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all"
            >
              <option value="USER">Normal User (Browse & Rate Stores)</option>
              <option value="STORE_OWNER">Store Owner (Manage Store)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neo mt-3 py-3 px-4 bg-neo-accent text-white font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING ACCOUNT..." : "REGISTER ACCOUNT →"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t-4 border-black text-center text-xs font-bold uppercase tracking-wider">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-black text-black underline hover:bg-neo-secondary px-1"
          >
            Sign in here ★
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
