import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInspector: boolean;
  isConsumer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('civicflow_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Session expired or invalid token:", err);
          logout();
        }
      } else {
        // Default demo user fallback for quick inspection
        setUser({
          id: 'demo-inspector-id',
          name: 'Vikram Singh (Inspector)',
          email: 'inspector@civicflow.gov.in',
          role: 'INSPECTOR',
          phone: '+91 98111 22233'
        });
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('civicflow_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('civicflow_token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || 'INSPECTOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: role === 'ADMIN',
        isInspector: role === 'INSPECTOR' || role === 'ADMIN',
        isConsumer: role === 'CONSUMER',
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
