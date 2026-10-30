import axios from 'axios';

// In-memory + sessionStorage token store for seamless SPA persistence
const TOKEN_KEY = 'apexcare_jwt_token';
let inMemoryJwtToken = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;

export const setAuthToken = (token) => {
  inMemoryJwtToken = token;
  if (typeof window !== 'undefined') {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = () =>
  inMemoryJwtToken || (typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null);

export const clearAuthToken = () => {
  inMemoryJwtToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
};

// Global toggle for mock vs real Spring Boot backend endpoints
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Central Axios Client
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor to inject the in-memory JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryJwtToken) {
      config.headers.Authorization = `Bearer ${inMemoryJwtToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for centralized error management
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      // Optional: trigger custom event for session expiry
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// Utility helper to simulate network latency for all mock calls
export const simulateDelay = (ms = 450) =>
  new Promise((resolve) => setTimeout(resolve, ms));
