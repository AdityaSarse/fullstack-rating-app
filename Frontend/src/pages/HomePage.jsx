import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Home</h1>
      <p>Welcome to the Store Rating Application.</p>
      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/stores">Stores</Link>
        <Link to="/dashboard">User Dashboard</Link>
        <Link to="/owner">Store Owner</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </div>
  );
};

export default HomePage;
