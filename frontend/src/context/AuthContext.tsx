// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authStorage, User, Company } from '../services/api';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerCompany: (formData: any) => Promise<void>;
  logout: () => void;
  updateCompanyProfile: (data: Partial<Company>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authStorage.getUser());
  const [company, setCompany] = useState<Company | null>(authStorage.getCompany());
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const savedToken = authStorage.getToken();
    if (!savedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentSession();
      setUser(res.user);
      setCompany(res.company);
      authStorage.setUser(res.user);
      authStorage.setCompany(res.company);
    } catch (err) {
      console.warn('Session verification error, clearing stored auth token');
      authStorage.clearToken();
      setUser(null);
      setCompany(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    authStorage.setCompany(res.company);
    setToken(res.token);
    setUser(res.user);
    setCompany(res.company);
  };

  const registerCompany = async (formData: any) => {
    const res = await api.registerCompany(formData);
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    authStorage.setCompany(res.company);
    setToken(res.token);
    setUser(res.user);
    setCompany(res.company);
  };

  const logout = () => {
    authStorage.clearToken();
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  const updateCompanyProfile = async (data: Partial<Company>) => {
    if (!company) return;
    const updated = await api.updateCompany(company.id, data);
    setCompany(updated);
    authStorage.setCompany(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        token,
        isAuthenticated: !!token && !!company,
        loading,
        login,
        registerCompany,
        logout,
        updateCompanyProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
