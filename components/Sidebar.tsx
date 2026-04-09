import Link from 'next/link';
import {
  Activity,
  BarChart3,
  Briefcase,
  LayoutGrid,
  MessageCircle,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/products', label: 'Products', icon: Briefcase },
//   { href: '#', label: 'Analytics', icon: BarChart3 },
//   { href: '#', label: 'Messages', icon: MessageCircle },
//   { href: '#', label: 'Security', icon: ShieldCheck },
//   { href: '#', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-800 bg-[#1f183ff2] p-6 shadow-card xl:block">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <p className="text-lg font-semibold text-white">Digital Hallmark</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
