
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthUserStateChanged } from '@/services/authService';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const unprotectedRoutes = ['/login'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthUserStateChanged((user, profile) => {
      setCurrentUser(user);
      setUserProfile(profile);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = !unprotectedRoutes.includes(pathname);

      if (!currentUser && isProtectedRoute) {
        // If user is not logged in and tries to access a protected route, redirect to login
        router.push('/login');
      } else if (currentUser && pathname === '/login') {
        // If user is logged in and tries to access login page, redirect to home
        router.push('/');
      }
    }
  }, [currentUser, loading, router, pathname]);

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md space-y-4 p-4">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-64 w-full" />
                 <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
