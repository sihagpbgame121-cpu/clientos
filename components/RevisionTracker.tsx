import { card } from "@/lib/ui";

export default function RevisionTracker({ used, limit }: { used: number; limit: number }) {
  const reached = used >= limit;
  const pct = limit ? Math.min(100, (used / limit) * 100) : 100;
  return (
    <div className={`${card} p-5`}>
      <p className="text-sm text-zinc-400">Revisions</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{used} / {limit}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label="Revisions used">
        <div className={`h-full rounded-full ${reached ? "bg-amber-400" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
      </div>
      {reached && <p role="alert" className="mt-3 text-sm font-medium text-amber-300">Revision limit reached.</p>}
    </div>
  );
}
