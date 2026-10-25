"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ProjectTable from "@/components/ProjectTable";
import CreateProjectModal from "@/components/CreateProjectModal";
import { getSupabase } from "@/lib/supabase";
import { ProjectRow, money } from "@/lib/types";
import { btn, card } from "@/lib/ui";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [pending, setPending] = useState(0);
  const [revenue, setRevenue] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const sb = getSupabase();
      const [p, t, pay] = await Promise.all([
        sb.from("projects").select("*, clients(name)").order("created_at", { ascending: false }),
        sb.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
        sb.from("payments").select("amount,currency").eq("status", "paid"),
      ]);
      if (p.error) throw p.error;
      setProjects(p.data as ProjectRow[]);
      setPending(t.count ?? 0);
      const totals: Record<string, number> = {};
      for (const r of pay.data ?? []) totals[r.currency] = (totals[r.currency] ?? 0) + Number(r.amount);
      setRevenue(totals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const stats = [
    { label: "Active projects", value: projects?.filter((x) => x.status === "active").length },
    { label: "Awaiting approval", value: projects?.filter((x) => x.status === "awaiting_approval").length },
    { label: "Pending tasks", value: projects ? pending : undefined },
    { label: "Revenue", value: projects ? (Object.entries(revenue).map(([c, a]) => money(a, c)).join(" · ") || money(0)) : undefined },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <button className={btn} onClick={() => setOpen(true)}><Plus size={16} /> New Project</button>
      </div>

      <section aria-label="Overview" className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} p-4 transition hover:border-white/20`}>
            <p className="text-sm text-zinc-400">{s.label}</p>
            {s.value === undefined
              ? <div className="mt-2 h-7 w-16 animate-pulse rounded bg-white/10" />
              : <p className="mt-1 break-words text-2xl font-semibold tabular-nums">{s.value}</p>}
          </div>
        ))}
      </section>

      {error ? (
        <div role="alert" className={`${card} p-8 text-center`}>
          <p className="mb-3 text-red-300">{error}</p>
          <button onClick={load} className={btn}>Retry</button>
        </div>
      ) : projects === null ? (
        <div className={`${card} space-y-3 p-5`}>{[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-white/5" />)}</div>
      ) : projects.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="font-medium">No projects yet</p>
          <p className="mb-4 mt-1 text-sm text-zinc-400">Create your first project and share a review link with your client.</p>
          <button className={btn} onClick={() => setOpen(true)}><Plus size={16} /> New Project</button>
        </div>
      ) : (
        <ProjectTable projects={projects} />
      )}

      {open && <CreateProjectModal onClose={() => setOpen(false)} onCreated={load} />}
    </DashboardLayout>
  );
}
