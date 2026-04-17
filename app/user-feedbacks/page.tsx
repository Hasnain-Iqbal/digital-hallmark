"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AuthGuard from '../../components/AuthGuard';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../components/AuthProvider';
import { Clock3, MessageSquare, Users } from 'lucide-react';

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

interface Feedback {
  id: string;
  message: string;
  timestamp?: string | FirestoreTimestamp;
  userEmail: string;
  userId: string;
  userName: string;
}

function formatFeedbackTimestamp(value?: string | FirestoreTimestamp) {
  if (!value) return 'Unknown';
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }
  return new Date(value.seconds * 1000).toLocaleString();
}

export default function UserFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbacksSnapshot = await getDocs(collection(db, 'feedbacks'));
        const feedbackList = feedbacksSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Feedback))
          .sort((a, b) => {
            const getTime = (value?: string | FirestoreTimestamp) => {
              if (!value) return 0;
              if (typeof value === 'string') return new Date(value).getTime();
              return value.seconds * 1000;
            };
            return getTime(b.timestamp) - getTime(a.timestamp);
          });

        setFeedbacks(feedbackList);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError('Unable to load feedbacks.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const totalFeedbacks = feedbacks.length;
  const uniqueUsers = Array.from(new Set(feedbacks.map((f) => f.userId))).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          <main className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-card">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">User feedback</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => void logout()}
                    className="rounded-full bg-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-600"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </section>

            {/* <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-card">
                <div className="flex items-center gap-3 text-cyan-300">
                  <MessageSquare className="h-5 w-5" />
                  <p className="text-sm uppercase tracking-[0.3em]">Feedbacks</p>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{totalFeedbacks}</p>
                <p className="mt-2 text-sm text-slate-400">Total feedback messages</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-card">
                <div className="flex items-center gap-3 text-cyan-300">
                  <Users className="h-5 w-5" />
                  <p className="text-sm uppercase tracking-[0.3em]">Users</p>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{uniqueUsers}</p>
                <p className="mt-2 text-sm text-slate-400">Unique users</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-card">
                <div className="flex items-center gap-3 text-cyan-300">
                  <Clock3 className="h-5 w-5" />
                  <p className="text-sm uppercase tracking-[0.3em]">Latest</p>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white text-sm">{feedbacks[0] ? formatFeedbackTimestamp(feedbacks[0].timestamp) : '--'}</p>
                <p className="mt-2 text-sm text-slate-400">Most recent feedback</p>
              </div>
            </section> */}

            {error && (
              <div className="rounded-3xl border border-red-800 bg-red-950/20 p-4 text-red-400">
                {error}
              </div>
            )}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-card">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Feedback List</p>
                  {/* <h2 className="text-2xl font-semibold text-white">All user feedbacks</h2> */}
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                  {feedbacks.length} messages
                </span>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 shadow-inner">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">User Name</th>
                      <th className="px-6 py-4 font-medium">Message</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">User ID</th>
                      <th className="px-6 py-4 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse border-t border-slate-800 bg-slate-900/50">
                          <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-full rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-36 rounded bg-slate-800" /></td>
                        </tr>
                      ))
                    ) : feedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                          No feedbacks found.
                        </td>
                      </tr>
                    ) : (
                      feedbacks.map((feedback) => (
                        <tr key={feedback.id} className="border-t border-slate-800 hover:bg-slate-900/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{feedback.userName || 'Unknown'}</td>
                          <td className="px-6 py-4 text-slate-300 max-w-2xl">{feedback.message || '—'}</td>
                          <td className="px-6 py-4 text-slate-400">{feedback.userEmail || '—'}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{feedback.userId || '—'}</td>
                          <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{formatFeedbackTimestamp(feedback.timestamp)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
