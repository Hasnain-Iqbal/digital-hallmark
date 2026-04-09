"use client";

import { Activity, ShoppingBag, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';
import AuthGuard from '../../components/AuthGuard';
import { Sidebar } from '../../components/Sidebar';
import { StatCard } from '../../components/StatCard';
import { RecentActivity } from '../../components/RecentActivity';

const stats = [
  {
    title: 'Total revenue',
    value: '$145.8K',
    description: 'Revenue increase over last month.',
    icon: Sparkles,
  },
  {
    title: 'Active users',
    value: '8.2K',
    description: 'Users who signed in this week.',
    icon: Users,
  },
  {
    title: 'Orders',
    value: '1,214',
    description: 'Completed orders this month.',
    icon: ShoppingBag,
  },
  {
    title: 'Live sessions',
    value: '62',
    description: 'Realtime sessions currently active.',
    icon: Activity,
  },
];

const tableRows = [
  { id: '#8349', customer: 'Mina Patel', status: 'Delivered', amount: '$1,280' },
  { id: '#8350', customer: 'Jonas Carter', status: 'Processing', amount: '$560' },
  { id: '#8351', customer: 'Eve Williams', status: 'Pending', amount: '$320' },
  { id: '#8352', customer: 'Nina Gray', status: 'Delivered', amount: '$2,100' },
];

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#4c5683] px-6 py-8 text-slate-100">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          <main className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-[#1f183ff2] p-6 shadow-card">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Overview</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard overview</h1>
                  <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                    Monitor key metrics, review recent activity, and get insights about the performance of your admin portal.
                  </p>
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
              {stats.map((stat) => (
                <StatCard key={stat.title} icon={stat.icon} title={stat.title} value={stat.value} description={stat.description} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-3xl border border-slate-800 bg-[#1f183ff2] p-6 shadow-card">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Sales</p>
                    <h2 className="text-2xl font-semibold text-white">Recent orders</h2>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                    4 orders
                  </span>
                </div>
                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
                    <thead className="bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 font-medium text-slate-400">Order</th>
                        <th className="px-6 py-4 font-medium text-slate-400">Customer</th>
                        <th className="px-6 py-4 font-medium text-slate-400">Status</th>
                        <th className="px-6 py-4 font-medium text-slate-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-800 last:border-b-0">
                          <td className="px-6 py-4 font-medium text-white">{row.id}</td>
                          <td className="px-6 py-4">{row.customer}</td>
                          <td className="px-6 py-4">{row.status}</td>
                          <td className="px-6 py-4 text-slate-200">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <RecentActivity />
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
