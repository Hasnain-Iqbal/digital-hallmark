const activities = [
  { label: 'New user signup', detail: 'Alice joined the platform', time: '2m ago' },
  { label: 'Payment processed', detail: 'Order #7384 paid', time: '14m ago' },
  { label: 'Server alert', detail: 'CPU usage reached 84%', time: '37m ago' },
  { label: 'Task completed', detail: 'Product launch prep finished', time: '1h ago' },
];

export function RecentActivity() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Recent activity</p>
          <h2 className="text-xl font-semibold text-white">Live updates</h2>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
          Active
        </span>
      </div>
      <div className="space-y-4">
        {activities.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="font-medium text-slate-100">{item.label}</p>
            <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
