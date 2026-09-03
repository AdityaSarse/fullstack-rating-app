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

// Response interceptor: Global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401: Unauthorized -> remove token from localStorage and redirect to /login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    // 403, 404, 409, 422, 500, and network errors: reject normally without swallowing
    return Promise.reject(error);
  }
);

export default api;

