"use client";

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-10 text-center shadow-card">
          <p className="text-sm uppercase tracking-[0.33em] text-cyan-400/80">Authentication required</p>
          <p className="mt-4 text-lg leading-7 text-slate-300">Checking your session and redirecting to login…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
