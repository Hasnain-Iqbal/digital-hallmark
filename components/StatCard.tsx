import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
}

export function StatCard({ icon: Icon, title, value, description }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <div className="rounded-2xl bg-slate-900 p-3 text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
