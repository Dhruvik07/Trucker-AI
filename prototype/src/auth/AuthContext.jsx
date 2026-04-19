import React, { createContext, useContext, useState, useCallback } from 'react';
import { authenticate, parseToken, isValidToken } from './jwt';
import { setNavproToken, clearNavproToken, getNavproToken } from '../services/navproApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'trucker_ai_token';

function loadSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && isValidToken(token)) {
    return { token, user: parseToken(token), navproToken: getNavproToken() };
  }
  return { token: null, user: null, navproToken: '' };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const login = useCallback((username, password, navproJwt = '') => {
    const result = authenticate(username, password);
    if (!result) return { success: false, error: 'Invalid username or password.' };
    localStorage.setItem(TOKEN_KEY, result.token);
    if (navproJwt) setNavproToken(navproJwt);
    setSession({ token: result.token, user: result.user, navproToken: navproJwt });
    return { success: true };
  }, []);

  const updateNavproToken = useCallback((navproJwt) => {
    setNavproToken(navproJwt);
    setSession((prev) => ({ ...prev, navproToken: navproJwt }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    clearNavproToken();
    setSession({ token: null, user: null, navproToken: '' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...session, login, logout, updateNavproToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
