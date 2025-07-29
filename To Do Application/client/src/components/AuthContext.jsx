// src/components/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  // On mount, check if session cookie is present/valid
  useEffect(() => {
    apiFetch('/auth/me')
      .then(res => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await apiFetch('/auth/login', 'POST', { username, password });
    setUser(data.user);
    setToken(data.token); // not required for cookie session, but handy for some API calls
    return data;
  };

  const register = async (username, email, password) => {
    const data = await apiFetch('/auth/register', 'POST', { username, email, password });
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = async () => {
    await apiFetch('/auth/logout', 'POST');
    setUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
