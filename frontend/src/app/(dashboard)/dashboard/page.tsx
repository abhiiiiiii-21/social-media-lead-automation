export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-100">Dashboard</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Internal overview for Social Lead Automation platform operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500">Instagram Queue</span>
          <div className="text-2xl font-bold text-neutral-100">0</div>
          <p className="text-[11px] text-neutral-500">Active outreach campaigns</p>
        </div>
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500">LinkedIn Queue</span>
          <div className="text-2xl font-bold text-neutral-100">0</div>
          <p className="text-[11px] text-neutral-500">Active outreach campaigns</p>
        </div>
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500">Total Leads</span>
          <div className="text-2xl font-bold text-neutral-100">0</div>
          <p className="text-[11px] text-neutral-500">Captured in pipeline</p>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center">
        <span className="text-xs font-mono text-neutral-500">
          Placeholder Component: Connect to FastAPI backend endpoints when ready.
        </span>
      </div>
    </div>
  );
}
