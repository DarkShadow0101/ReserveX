import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session from backend /api/auth/me or cached user
  useEffect(() => {
    async function initAuth() {
      try {
        const cachedUser = localStorage.getItem('reservex_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            // ignore JSON parse error
          }
        }

        // Validate session with server (via cookie or stored token)
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('reservex_user', JSON.stringify(res.user));
        }
      } catch (err) {
        // Not logged in or session expired
        setUser(null);
        localStorage.removeItem('reservex_user');
        localStorage.removeItem('reservex_token');
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('reservex_user', JSON.stringify(res.user));
      if (res.token) {
        localStorage.setItem('reservex_token', res.token);
      }
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('reservex_user', JSON.stringify(res.user));
      if (res.token) {
        localStorage.setItem('reservex_token', res.token);
      }
    }
    return res;
  };

  const logout = async () => {
    setUser(null);
    await authApi.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isOrganizer: user?.role === 'owner' || user?.role === 'staff' || user?.role === 'admin',
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
