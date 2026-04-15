"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AuthGuard from '../../components/AuthGuard';
import { Sidebar } from '../../components/Sidebar';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

interface User {
  id: string;
  email: string;
  image: string;
  name: string;
  nationalId: string;
  phoneNumber: string;
  userId: string;
  subscriptionPlan?: string;
}

interface Activity {
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

const ITEMS_PER_PAGE = 10;

function UserAvatar({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 rounded-full bg-slate-700 animate-pulse" />
      )}
      {imageError ? (
        <div className="h-full w-full rounded-full bg-slate-700 flex items-center justify-center">
          <Users className="h-4 w-4 text-slate-400" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full rounded-full object-cover transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'digiluxUsers');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        setUsers(usersList);

        const transactionsCollection = collection(db, 'transactions');
        const transactionsSnapshot = await getDocs(transactionsCollection);
        const transactions = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Activity));

        const usersById = new Map(usersList.map((user) => [user.userId, user]));
        const activityList = transactions
          .map((activity) => ({
            ...activity,
            userName: usersById.get(activity.userId ?? '')?.name ?? 'Unknown user',
            userEmail: usersById.get(activity.userId ?? '')?.email ?? '',
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
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, endIndex);

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
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Users</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">User Management</h1>
                  {/* <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                    View and manage all registered users from the digiluxUsers collection.
                  </p> */}
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* <button className="rounded-full bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-800">
                    Export users
                  </button>
                  <button className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
                    Add user
                  </button> */}
                  <button
                    onClick={() => void logout()}
                    className="rounded-full bg-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-600"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-3xl border border-red-800 bg-red-950/20 p-4 text-red-400">
                {error}
              </div>
            )}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">All users</p>
                  <h2 className="text-2xl font-semibold text-white">Registered users</h2>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                  {loading ? '...' : `${users.length} users`}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-slate-400">Loading users...</div>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
                    <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
                      <thead className="bg-slate-950">
                        <tr>
                          <th className="px-6 py-4 font-medium text-slate-400">User</th>
                          <th className="px-6 py-4 font-medium text-slate-400">Email</th>
                          <th className="px-6 py-4 font-medium text-slate-400">Phone</th>
                          <th className="px-6 py-4 font-medium text-slate-400">National ID</th>
                          <th className="px-6 py-4 font-medium text-slate-400">Subscription Plan</th>
                          {/* <th className="px-6 py-4 font-medium text-slate-400">User ID</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user) => (
                          <tr key={user.id} className="border-t border-slate-800 last:border-b-0 hover:bg-slate-800/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  src={user.image}
                                  alt={user.name}
                                  className="h-10 w-10"
                                />
                                <div>
                                  <p className="font-medium text-white">{user.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">{user.phoneNumber}</td>
                            <td className="px-6 py-4">{user.nationalId}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.subscriptionPlan === 'Premium' 
                                  ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' 
                                  : user.subscriptionPlan === 'Pro'
                                  ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                                  : user.subscriptionPlan === 'Basic'
                                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                                  : 'bg-slate-700 text-slate-300 border border-slate-600'
                              }`}>
                                {/* {user.subscriptionPlan || 'N/A'} */}
                                {(user.subscriptionPlan || 'N/A').charAt(0).toUpperCase() + 
                                (user.subscriptionPlan || 'N/A').slice(1)}
                              </span>
                            </td>
                            {/* <td className="px-6 py-4 text-slate-200">{user.userId}</td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-slate-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} users
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
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}