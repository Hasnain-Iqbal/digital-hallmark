"use client";

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-card">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.33em] text-cyan-400/80">Sign in</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Digital Hallmark</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
