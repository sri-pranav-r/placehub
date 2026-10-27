import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  // Restore the session from the saved token
  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;
    api('/auth/me')
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  const handleAuth = ({ token, user }) => {
    tokenStore.set(token);
    setUser(user);
    return user;
  };

  const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(handleAuth);
  const register = (data) => api('/auth/register', { method: 'POST', body: data }).then(handleAuth);

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/student');
