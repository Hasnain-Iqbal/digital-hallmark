"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Activity, ShoppingBag, Sparkles, Users, AlertTriangle, Package, MessageCircle } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';
import AuthGuard from '../../components/AuthGuard';
import { Sidebar } from '../../components/Sidebar';
import { StatCard } from '../../components/StatCard';

interface Product {
  id: string;
  product_name: string;
  product_price: number;
  productCurrencySymbol: string;
  isProductStolen?: boolean;
  created_at?: string;
  product_category?: string;
  owner?: {
    name?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

interface Feedback {
  id: string;
  message: string;
  timestamp?: string;
  userEmail: string;
  userId: string;
  userName: string;
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const [stats, setStats] = useState([
    {
      title: 'Total products',
      value: '0',
      description: 'Products in inventory.',
      icon: Package,
    },
    {
      title: 'Total users',
      value: '0',
      description: 'Registered users.',
      icon: Users,
    },
    {
      title: 'Stolen products',
      value: '0',
      description: 'Products marked as stolen.',
      icon: AlertTriangle,
    },
    {
      title: 'Feedbacks',
      value: '0',
      description: 'User feedback messages.',
      icon: MessageCircle,
    },
  ]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products data
        const productsCollection = collection(db, 'digilusData');
        const productsSnapshot = await getDocs(productsCollection);
        const products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Fetch users data
        const usersCollection = collection(db, 'digiluxUsers');
        const usersSnapshot = await getDocs(usersCollection);
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        // Fetch feedbacks data
        const feedbacksCollection = collection(db, 'feedbacks');
        const feedbacksSnapshot = await getDocs(feedbacksCollection);
        const feedbacks = feedbacksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Feedback[];

        // Calculate statistics
        const totalProducts = products.length;
        const totalUsers = users.length;
        const stolenProducts = products.filter(product => product.isProductStolen === true).length;
        const totalFeedbacks = feedbacks.length;

        // Get recent products (last 5, sorted by created_at if available)
        const sortedProducts = products.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
        const recentProductsData = sortedProducts.slice(0, 5);

        // Get recent users (last 5, sorted by created_at if available)
        const sortedUsers = users.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
        const recentUsersData = sortedUsers.slice(0, 5);

        // Update state
        setStats([
          {
            title: 'Total products',
            value: totalProducts.toString(),
            description: 'Products in inventory.',
            icon: Package,
          },
          {
            title: 'Total users',
            value: totalUsers.toString(),
            description: 'Registered users.',
            icon: Users,
          },
          {
            title: 'Stolen products',
            value: stolenProducts.toString(),
            description: 'Products marked as stolen.',
            icon: AlertTriangle,
          },
          {
            title: 'Feedbacks',
            value: totalFeedbacks.toString(),
            description: 'User feedback messages.',
            icon: MessageCircle,
          },
        ]);

        setRecentProducts(recentProductsData);
        setRecentUsers(recentUsersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default stats on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          <main className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-card">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Overview</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard overview</h1>
                  {/* <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                    Monitor key metrics, review recent activity, and get insights about the performance of your admin portal.
                  </p> */}
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* <button className="rounded-full bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-800">
                    Export report
                  </button>
                  <button className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
                    Create task
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

            <section className="grid gap-6 xl:grid-cols-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-card">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-800"></div>
                      <div className="h-8 w-8 animate-pulse rounded-full bg-slate-800"></div>
                    </div>
                    <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-800"></div>
                    <div className="mt-2 h-4 w-32 animate-pulse rounded bg-slate-800"></div>
                  </div>
                ))
              ) : (
                stats.map((stat) => (
                  <StatCard key={stat.title} icon={stat.icon} title={stat.title} value={stat.value} description={stat.description} />
                ))
              )}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              {/* Recent Products */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-card">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Products</p>
                    <h2 className="text-2xl font-semibold text-white">Recent products</h2>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                    {recentProducts.length} products
                  </span>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    // Loading skeleton for products
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-800 mb-2"></div>
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-800 mb-1"></div>
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-800"></div>
                      </div>
                    ))
                  ) : recentProducts.length > 0 ? (
                    recentProducts.map((product) => (
                      <div key={product.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="font-medium text-slate-100">{product.product_name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {product.product_category} • {product.productCurrencySymbol}{product.product_price}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
                          Owner: {product.owner?.name || 'Unknown'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                      <p className="text-slate-400">No products found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Users */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-card">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Users</p>
                    <h2 className="text-xl font-semibold text-white">Recent users</h2>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                    {recentUsers.length} users
                  </span>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    // Loading skeleton for users
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-800 mb-2"></div>
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-800"></div>
                      </div>
                    ))
                  ) : recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div key={user.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="font-medium text-slate-100">{user.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                      <p className="text-slate-400">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
