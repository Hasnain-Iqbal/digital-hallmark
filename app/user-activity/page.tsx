"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AuthGuard from '../../components/AuthGuard';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../components/AuthProvider';
import { Activity as ActivityIcon, Clock3, DollarSign, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

interface User {
  id: string;
  email: string;
  name: string;
  userId: string;
}

interface ActivityRecord {
  id: string;
  amount?: number | string;
  currency?: string;
  description?: string;
  timestamp?: string | FirestoreTimestamp;
  title?: string;
  type?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

function formatActivityTimestamp(value?: string | FirestoreTimestamp) {
  if (!value) return 'Unknown';
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }
  return new Date(value.seconds * 1000).toLocaleString();
}

export default function UserActivityPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'digiluxUsers'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        })) as User[];

        const userById = new Map(usersList.map((user) => [user.userId, user]));

        const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
        const activityList = transactionsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as ActivityRecord))
          .map((activity) => ({
            ...activity,
            userName: userById.get(activity.userId ?? '')?.name ?? 'Unknown user',
            userEmail: userById.get(activity.userId ?? '')?.email ?? '',
          }))
          .sort((a, b) => {
            const getTime = (value?: string | FirestoreTimestamp) => {
              if (!value) return 0;
              if (typeof value === 'string') return new Date(value).getTime();
              return value.seconds * 1000;
            };
            return getTime(b.timestamp) - getTime(a.timestamp);
          });

        setActivities(activityList);
      } catch (err) {
        console.error('Error fetching user activity:', err);
        setError('Unable to load user activity.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const totalUsers = Array.from(new Set(activities.map((activity) => activity.userId))).length;
  const totalTransactions = activities.length;

  // Calculate pagination
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentActivities = activities.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    goToPage(currentPage - 1);
  };

  const goToNext = () => {
    goToPage(currentPage + 1);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          <main className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-card">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">User activity</p>
                  {/* <h1 className="mt-3 text-3xl font-semibold text-white">Transaction history</h1>
                  <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                    View all user transactions and activity records linked by user ID.
                  </p> */}
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
                  <DollarSign className="h-5 w-5" />
                  <p className="text-sm uppercase tracking-[0.3em]">Transactions</p>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{totalTransactions}</p>
                <p className="mt-2 text-sm text-slate-400">Total activity records</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-card">
                <div className="flex items-center gap-3 text-cyan-300">
                  <Users className="h-5 w-5" />
                  <p className="text-sm uppercase tracking-[0.3em]">Users</p>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{totalUsers}</p>
                <p className="mt-2 text-sm text-slate-400">Unique users with activity</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-card">
                <div className="flex items-center gap-3 text-cyan-300">
                  <Clock3 className="h-5 w-5" />
                  <p className="text-sm uppercase tracking-[0.3em]">Latest</p>
                </div>
                <p className="mt-4 text-4xl font-semibold text-white">{activities[0] ? formatActivityTimestamp(activities[0].timestamp) : '--'}</p>
                <p className="mt-2 text-sm text-slate-400">Most recent transaction</p>
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
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Activities</p>
                  {/* <h2 className="text-2xl font-semibold text-white">Recent transactions</h2> */}
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                  {activities.length} records
                </span>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 shadow-inner">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Title / Description</th>
                      {/* <th className="px-6 py-4 font-medium">Description</th> */}
                      <th className="px-6 py-4 font-medium">Amount</th>
                      
                      <th className="px-6 py-4 font-medium">Time</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse border-t border-slate-800 bg-slate-900/50">
                          <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-full rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-800" /></td>
                        </tr>
                      ))
                    ) : activities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                          No user activity found.
                        </td>
                      </tr>
                    ) : (
                      currentActivities.map((activity) => (
                        <tr key={activity.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                          <td className="px-6 py-4 text-slate-300">{activity.userName || 'Unknown'}</td>
                          <td className="px-6 py-4 font-medium text-white">{activity.title || 'Transaction'}<br/><span className="py-4 text-slate-400 text-xs max-w-xl truncate">{activity.description}</span></td>
                          {/* <td className="px-6 py-4 text-slate-400 max-w-xl truncate">{activity.description}</td> */}
                          <td className="px-6 py-4 text-slate-100">{activity.amount != null ? `${activity.amount} ${activity.currency ?? ''}` : '—'}</td>
                          <td className="px-6 py-4 text-slate-400">{formatActivityTimestamp(activity.timestamp)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              activity.type === 'transferRequest' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                              activity.type === 'payment' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                              'bg-slate-700/70 text-slate-300 border border-slate-600'
                            }`}>
                              {activity.type ? activity.type.replace(/([A-Z])/g, ' $1').trim() : 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, activities.length)} of {activities.length} transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevious}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNumber > totalPages) return null;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-3 py-2 text-sm rounded-lg transition ${
                              currentPage === pageNumber
                                ? 'bg-cyan-500 text-slate-950'
                                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNext}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
