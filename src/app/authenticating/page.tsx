
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthenticatingPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the loading is false and we have a user profile
    if (!loading && userProfile) {
      router.replace('/'); // Use replace to avoid user going back to this page
    }
    
    // Handle case where user is not logged in or profile fails to load
    if (!loading && !userProfile) {
        router.replace('/login');
    }

  }, [userProfile, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-semibold">Autenticando...</h1>
      <p className="text-muted-foreground">Aguarde, estamos verificando suas credenciais.</p>
    </div>
  );
}
