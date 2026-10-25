"use client";
import { useState, FormEvent } from "react";
import { fmtTime } from "@/lib/types";
import { input, btn } from "@/lib/ui";

export default function CommentForm({ ts, disabled, onSubmit }: {
  ts: number; disabled?: boolean; onSubmit: (body: string) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return setErr("Write a comment first");
    setErr(""); setBusy(true);
    try { await onSubmit(body.trim()); setBody(""); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="cbody" className="text-sm text-zinc-300">New comment at <span className="font-medium text-indigo-300 tabular-nums">{fmtTime(ts)}</span></label>
      <textarea id="cbody" rows={3} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder="e.g. Make this text white" className={input} disabled={disabled} />
      {err && <p className="text-xs text-red-400">{err}</p>}
      <button className={`${btn} w-full`} disabled={busy || disabled}>{busy ? "Posting…" : "Add comment"}</button>
    </form>
  );
}
