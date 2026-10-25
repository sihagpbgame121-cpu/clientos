"use client";
import { TaskRow, TaskStatus, fmtTime } from "@/lib/types";
import { card, input } from "@/lib/ui";

const COLS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "Todo" }, { id: "in_progress", label: "In Progress" }, { id: "done", label: "Done" },
];

export default function TaskList({ tasks, onStatus }: { tasks: TaskRow[]; onStatus: (t: TaskRow, s: TaskStatus) => void }) {
  if (!tasks.length)
    return <div className={`${card} p-8 text-center text-sm text-zinc-400`}>No tasks yet. In the Review tab, use the checklist icon on a comment to turn it into a task.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLS.map((col) => (
        <section key={col.id} aria-label={col.label} className={`${card} p-3`}>
          <h3 className="mb-3 px-1 text-sm font-medium text-zinc-300">{col.label} <span className="text-zinc-600">{tasks.filter((t) => t.status === col.id).length}</span></h3>
          <ul className="space-y-2">
            {tasks.filter((t) => t.status === col.id).map((t) => (
              <li key={t.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="break-words text-sm font-medium">{t.title}</p>
                {t.description && t.description !== t.title && <p className="mt-1 break-words text-xs text-zinc-400">{t.description}</p>}
                <div className="mt-2 flex items-center justify-between gap-2">
                  {t.timestamp_sec !== null && <span className="text-xs tabular-nums text-indigo-300">{fmtTime(t.timestamp_sec)}</span>}
                  <select aria-label={`Status of ${t.title}`} value={t.status} onChange={(e) => onStatus(t, e.target.value as TaskStatus)} className={`${input} !w-auto !py-1 text-xs`}>
                    {COLS.map((c) => <option key={c.id} value={c.id} className="bg-zinc-900">{c.label}</option>)}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
