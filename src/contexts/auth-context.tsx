
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { verifyUser } from '@/services/userService';

export type Role = 'adm' | 'rh' | 'portaria';

interface AuthContextType {
  isAuthenticated: boolean;
  role: Role | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sessionRole = sessionStorage.getItem('userRole') as Role | null;
    if (sessionRole) {
      setRole(sessionRole);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const userRole = await verifyUser(username, password);
    if (userRole) {
      setRole(userRole);
      setIsAuthenticated(true);
      sessionStorage.setItem('userRole', userRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('userRole');
    router.push('/login');
  };

  const value = { isAuthenticated, role, login, logout };
  
  // While checking for session, you can return a loader
  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Component to protect routes
export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, role } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isClient, router]);

    if (!isClient || !isAuthenticated) {
        return null; // Or return a loading spinner
    }

    return <>{children}</>;
};

