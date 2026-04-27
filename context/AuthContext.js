'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { userId, username, email }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('resumeai_user');
      const storedToken = localStorage.getItem('resumeai_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to rehydrate auth state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Call this after a successful login or register API response.
   * @param {{ token: string, userId: string, username: string }} authData
   */
  function login(authData) {
    const userData = {
      userId: authData.userId,
      username: authData.username,
      email: authData.email || '',
    };
    setUser(userData);
    setToken(authData.token);
    localStorage.setItem('resumeai_user', JSON.stringify(userData));
    localStorage.setItem('resumeai_token', authData.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('resumeai_user');
    localStorage.removeItem('resumeai_token');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
