"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "./Toast";
import { fmtTime } from "@/lib/types";
import { input, btn, btnGhost, card } from "@/lib/ui";

type Change = { timestamp: number; title: string; description: string };
const EXAMPLE = "Bhai 27 sec pe text white kar dena, 42 pe music thoda kam karna aur last wala shot hata dena.";

export default function AIChangeDetector({ projectId, onCreated }: { projectId: string; onCreated: () => void }) {
  const toast = useToast();
  const [message, setMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);

  async function detect() {
    if (!message.trim()) return toast("Paste the client message first", "err");
    setBusy(true);
    try {
      const { data: sess } = await getSupabase().auth.getSession();
      const res = await fetch("/api/ai-feedback", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token ?? ""}` }, body: JSON.stringify({ message, transcript }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Detection failed");
      setChanges(j.changes); setSource(j.source);
    } catch (e) { toast(e instanceof Error ? e.message : "Detection failed", "err"); }
    finally { setBusy(false); }
  }
  async function create() {
    if (!changes?.length) return;
    setBusy(true);
    const { error } = await getSupabase().from("tasks").insert(
      changes.map((c) => ({ project_id: projectId, title: c.title, description: c.description, timestamp_sec: c.timestamp })));
    setBusy(false);
    if (error) return toast(error.message, "err");
    toast(`${changes.length} task${changes.length > 1 ? "s" : ""} created`);
    setChanges(null); setMessage(""); setTranscript(""); onCreated();
  }

  return (
    <section aria-label="AI Feedback" className={`${card} p-5`}>
      <h2 className="mb-1 flex items-center gap-2 font-medium"><Sparkles size={16} className="text-indigo-300" /> AI Feedback</h2>
      <p className="mb-3 text-sm text-zinc-400">Paste a WhatsApp message or voice note text. ClientOS finds the changes and timestamps.</p>
      <label htmlFor="aimsg" className="mb-1.5 block text-sm text-zinc-300">Client message</label>
      <textarea id="aimsg" rows={3} className={input} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} />
      <label htmlFor="aitr" className="mb-1.5 mt-3 block text-sm text-zinc-300">Voice transcription (optional)</label>
      <textarea id="aitr" rows={2} className={input} value={transcript} onChange={(e) => setTranscript(e.target.value)} maxLength={5000} />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={btn} onClick={detect} disabled={busy}>{busy && !changes ? "Detecting…" : "Detect changes"}</button>
        <button className={btnGhost} onClick={() => setMessage(EXAMPLE)}>Use example</button>
      </div>
      {changes && (
        <div className="mt-5">
          {changes.length === 0 ? <p className="text-sm text-zinc-400">No changes with a timestamp were found. Try including times like &ldquo;27 sec&rdquo;.</p> : (
            <>
              <p className="mb-2 text-xs text-zinc-500">{changes.length} change(s) detected{source === "mock" ? " (mock AI, add OPENAI_API_KEY for smarter results)" : ""}</p>
              <ul className="space-y-2">
                {changes.map((c, i) => (
                  <li key={i} className="rounded-xl border border-white/10 p-3 text-sm">
                    <span className="mr-2 rounded-md bg-indigo-400/10 px-2 py-0.5 text-xs tabular-nums text-indigo-300">{fmtTime(c.timestamp)}</span>
                    <span className="font-medium">{c.title}</span>
                    <p className="mt-1 break-words text-zinc-400">{c.description}</p>
                  </li>
                ))}
              </ul>
              <button className={`${btn} mt-3`} onClick={create} disabled={busy}>Create Tasks</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
