// src/services/api.js
//
// Centralized Axios instance for communication with the backend API.
// Base URL is configured here so it is not hardcoded across components.
// Automatically attaches Authorization: Bearer <token> if token exists in localStorage.

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
