"use client";
import { useState } from "react";
import { Check, Pencil, Trash2, ListTodo, RotateCcw } from "lucide-react";
import { CommentRow, fmtTime } from "@/lib/types";
import { input, btn, btnGhost } from "@/lib/ui";

const icon = "rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300";

export default function CommentThread({ comments, meId, version, taskIds, onSeek, onResolve, onEdit, onDelete, onToTask }: {
  comments: CommentRow[]; meId: string; version: number; taskIds: Set<string>;
  onSeek: (t: number) => void; onResolve: (c: CommentRow) => void;
  onEdit: (c: CommentRow, body: string) => Promise<void>; onDelete: (c: CommentRow) => void; onToTask: (c: CommentRow) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");

  if (!comments.length)
    return <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">No comments yet. Click the timeline to add the first one.</p>;

  return (
    <ul className="space-y-3">
      {comments.map((c) => {
        const mine = c.user_id === meId;
        return (
          <li key={c.id} className={`rounded-xl border p-3 ${c.status === "resolved" ? "border-emerald-400/20 bg-emerald-400/[0.03]" : "border-white/10 bg-white/[0.02]"}`}>
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
              <button onClick={() => onSeek(c.timestamp_sec)} className="rounded-md bg-indigo-400/10 px-2 py-0.5 font-medium tabular-nums text-indigo-300 hover:bg-indigo-400/20">{fmtTime(c.timestamp_sec)}</button>
              <span className="text-zinc-300">{c.author_name}{c.user_id === null && " (client)"}</span>
              <span className="text-zinc-600">v{version}</span>
              <span className={`ml-auto rounded-full px-2 py-0.5 ${c.status === "resolved" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{c.status}</span>
            </div>
            {editing === c.id ? (
              <div className="space-y-2">
                <textarea className={input} rows={2} value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit comment" />
                <div className="flex gap-2">
                  <button className={btn} onClick={async () => { if (text.trim()) { await onEdit(c, text.trim()); setEditing(null); } }}>Save</button>
                  <button className={btnGhost} onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm text-zinc-200">{c.body}</p>
            )}
            <div className="mt-2 flex items-center gap-1">
              <button className={icon} onClick={() => onResolve(c)} aria-label={c.status === "open" ? "Resolve comment" : "Reopen comment"} title={c.status === "open" ? "Resolve" : "Reopen"}>
                {c.status === "open" ? <Check size={16} /> : <RotateCcw size={16} />}
              </button>
              <button className={icon} disabled={taskIds.has(c.id)} onClick={() => onToTask(c)} aria-label="Convert to task" title={taskIds.has(c.id) ? "Already a task" : "Convert to task"}>
                <ListTodo size={16} className={taskIds.has(c.id) ? "opacity-30" : ""} />
              </button>
              {mine && <>
                <button className={icon} onClick={() => { setEditing(c.id); setText(c.body); }} aria-label="Edit comment"><Pencil size={16} /></button>
                <button className={icon} onClick={() => confirm("Delete this comment?") && onDelete(c)} aria-label="Delete comment"><Trash2 size={16} /></button>
              </>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
