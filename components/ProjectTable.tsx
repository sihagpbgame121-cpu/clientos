import Link from "next/link";
import { ProjectRow, STATUS_LABEL, badge, money } from "@/lib/types";
import { card } from "@/lib/ui";


export default function ProjectTable({ projects }: { projects: ProjectRow[] }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="hidden grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr] gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wide text-zinc-500 md:grid">
        <span>Project</span><span>Client</span><span>Status</span><span>Deadline</span><span className="text-right">Amount</span>
      </div>
      <ul>
        {projects.map((p) => (
          <li key={p.id} className="border-b border-white/5 last:border-0">
            <Link href={`/projects/${p.id}`}
              className="grid grid-cols-2 items-center gap-2 px-5 py-4 transition hover:bg-white/[0.03] focus-visible:bg-white/[0.05] focus-visible:outline-none md:grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr] md:gap-4">
              <span className="col-span-2 truncate font-medium md:col-span-1">{p.name}</span>
              <span className="truncate text-sm text-zinc-400">{p.clients?.name ?? "—"}</span>
              <span><span className={`rounded-full px-2.5 py-1 text-xs ${badge[p.status]}`}>{STATUS_LABEL[p.status]}</span></span>
              <span className="text-sm text-zinc-400">{p.deadline ? new Date(p.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "No deadline"}</span>
              <span className="text-right text-sm tabular-nums">{money(Number(p.price), p.currency)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
