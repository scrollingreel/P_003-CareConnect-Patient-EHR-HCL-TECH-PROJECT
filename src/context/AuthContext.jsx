import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, DEMO_ACCOUNTS, setAuthToken, clearAuthToken, getAuthToken, USE_MOCK } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Default to demo patient Ananya Sharma for frictionless first view, but fully switchable
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('apexcare_user');
      return saved ? JSON.parse(saved) : DEMO_ACCOUNTS.patient;
    } catch {
      return DEMO_ACCOUNTS.patient;
    }
  });

  const [token, setToken] = useState(() => {
    const existing = getAuthToken();
    if (existing) return existing;
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: DEMO_ACCOUNTS.patient.id, role: 'patient', exp: Date.now() + 3600000 })
    )}.mockSignature`;
    setAuthToken(mockJwt);
    return mockJwt;
  });
  const [loading, setLoading] = useState(false);

  // Background authenticate with real backend if in real mode and not yet holding a real backend token
  useEffect(() => {
    if (!USE_MOCK && (!token || token.includes('mockSignature'))) {
      authApi
        .login({
          email: user?.email || 'ananya.sharma@example.com',
          password: 'SecurePass2026!',
          role: user?.role || 'patient'
        })
        .then((res) => {
          if (res?.token) {
            setToken(res.token);
            setAuthToken(res.token);
            if (res.user) {
              setUser(res.user);
              sessionStorage.setItem('apexcare_user', JSON.stringify(res.user));
            }
          }
        })
        .catch((err) => {
          console.warn('Silent real JWT exchange on load:', err);
        });
    }
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem('apexcare_user');
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async ({ email, password, role }) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password, role });
      setUser(response.user);
      setToken(response.token);
      sessionStorage.setItem('apexcare_user', JSON.stringify(response.user));
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (patientData) => {
    setLoading(true);
    try {
      const response = await authApi.register(patientData);
      setUser(response.user);
      setToken(response.token);
      sessionStorage.setItem('apexcare_user', JSON.stringify(response.user));
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    clearAuthToken();
    sessionStorage.removeItem('apexcare_user');
    setUser(null);
    setToken(null);
  };

  const switchDemoRole = async (roleName) => {
    if (DEMO_ACCOUNTS[roleName]) {
      const account = DEMO_ACCOUNTS[roleName];
      if (!USE_MOCK) {
        try {
          const res = await authApi.login({
            email: account.email,
            password: 'SecurePass2026!',
            role: account.role
          });
          setUser(res.user);
          setToken(res.token);
          setAuthToken(res.token);
          sessionStorage.setItem('apexcare_user', JSON.stringify(res.user));
          return res.user;
        } catch (e) {
          console.warn('Real login during switchDemoRole failed, falling back:', e);
        }
      }
      const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: account.id, role: account.role, exp: Date.now() + 3600000 })
      )}.mockSignature`;
      setAuthToken(mockJwt);
      setToken(mockJwt);
      setUser(account);
      sessionStorage.setItem('apexcare_user', JSON.stringify(account));
      return account;
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
    switchDemoRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
