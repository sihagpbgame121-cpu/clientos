"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import ClientReviewLayout from "@/components/ClientReviewLayout";
import MediaPlayer from "@/components/MediaPlayer";
import Timeline from "@/components/Timeline";
import CommentForm from "@/components/CommentForm";
import RevisionTracker from "@/components/RevisionTracker";
import { useToast } from "@/components/Toast";
import { getSupabase } from "@/lib/supabase";
import { fmtTime, PlayerHandle } from "@/lib/types";
import { input, btn, card } from "@/lib/ui";

type ReviewData = {
  project: { id: string; name: string; status: string; revision_limit: number; revisions_used: number };
  video: { id: string; version: number; source: "upload" | "youtube"; youtube_id: string | null } | null;
  comments: { id: string; author_name: string; timestamp_sec: number; body: string; status: string; by_client: boolean }[];
  approval: { approved_by: string; approved_at: string } | null;
};

export default function ClientReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const toast = useToast();
  const playerRef = useRef<PlayerHandle>(null);
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState("");
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: d, error } = await getSupabase().rpc("get_review", { p_slug: slug });
    if (error) toast(error.message, "err");
    setData((d as ReviewData | null) ?? null);
    setLoading(false);
  }, [slug, toast]);

  useEffect(() => { load(); try { setName(localStorage.getItem("clientos_name") ?? ""); } catch {} }, [load]);
  const isYT = data?.video?.source === "youtube";
  const hasVideo = !!data?.video && !isYT;
  useEffect(() => {
    if (!hasVideo) return;
    fetch(`/api/review-video?slug=${slug}`).then((r) => r.json()).then((j) => j.url ? setSrc(j.url) : toast(j.error || "Video unavailable", "err"));
  }, [hasVideo, slug, toast]);

  const locked = !!data?.approval;
  const markers = useMemo(() => (data?.comments ?? []).map((c) => ({ id: c.id, t: c.timestamp_sec, resolved: c.status === "resolved" })), [data]);

  function seek(t: number) { playerRef.current?.seek(t); setCurrent(t); setPending(t); }
  const needName = () => { if (!name.trim()) { toast("Please enter your name first", "err"); return true; } return false; };
  const saveName = (v: string) => { setName(v); try { localStorage.setItem("clientos_name", v); } catch {} };
  const fail = (m: string) => toast(m.includes("already_approved") ? "This project is already approved" : m, "err");

  async function comment(body: string) {
    if (needName()) return;
    const { error } = await getSupabase().rpc("add_review_comment", { p_slug: slug, p_author: name, p_ts: Number((pending ?? current).toFixed(2)), p_body: body });
    if (error) return fail(error.message);
    toast("Comment added"); setPending(null); await load();
  }
  async function requestChanges() {
    if (needName()) return;
    if (note.trim().length < 3) return toast("Describe the changes you want", "err");
    setBusy(true);
    const { error } = await getSupabase().rpc("request_review_changes", { p_slug: slug, p_note: `${name}: ${note.trim()}` });
    setBusy(false);
    if (error) return fail(error.message);
    toast("Changes requested"); setNote(""); await load();
  }
  async function approve() {
    if (needName()) return;
    if (!confirm("Approve the final video? This cannot be undone.")) return;
    setBusy(true);
    const { error } = await getSupabase().rpc("approve_review", { p_slug: slug, p_name: name });
    setBusy(false);
    if (error) return fail(error.message);
    toast("Final video approved"); await load();
  }

  if (loading) return <ClientReviewLayout><div className="aspect-video animate-pulse rounded-2xl bg-white/5" /></ClientReviewLayout>;
  if (!data)
    return (
      <ClientReviewLayout>
        <div role="alert" className={`${card} p-10 text-center`}>
          <p className="font-medium">This review link is not valid.</p>
          <p className="mt-1 text-sm text-zinc-400">Please ask your editor for a new link.</p>
        </div>
      </ClientReviewLayout>
    );

  const { project, video, comments, approval } = data;
  return (
    <ClientReviewLayout title={project.name} status={project.status}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {!video ? (
            <div className={`${card} flex aspect-video items-center justify-center p-6 text-center text-sm text-zinc-400`}>Your editor hasn&rsquo;t uploaded a video yet. Check back soon.</div>
          ) : (isYT || src) ? (
            <>
              <MediaPlayer ref={playerRef} youtubeId={isYT ? video.youtube_id : null} src={src} onTime={setCurrent} onDuration={setDuration} />
              <Timeline duration={duration} current={current} pending={pending} onSeek={seek} markers={markers} />
              {isYT && video.youtube_id && <a href={`https://www.youtube.com/watch?v=${video.youtube_id}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-indigo-300 hover:underline">Open on YouTube ↗</a>}
            </>
          ) : <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />}
        </div>

        <aside className="space-y-5" aria-label="Feedback">
          {approval ? (
            <div className={`${card} border-emerald-400/30 p-5`}>
              <p className="flex items-center gap-2 text-lg font-semibold text-emerald-300"><CheckCircle2 size={20} /> Final video approved</p>
              <p className="mt-2 text-sm text-zinc-400">By {approval.approved_by}<br />{new Date(approval.approved_at).toLocaleString("en-IN")}</p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="cname" className="mb-1.5 block text-sm text-zinc-300">Your name</label>
                <input id="cname" className={input} value={name} onChange={(e) => saveName(e.target.value)} maxLength={80} autoComplete="name" />
              </div>
              {video && <CommentForm ts={pending ?? current} onSubmit={comment} />}
            </>
          )}

          <h2 className="text-sm font-medium text-zinc-300">Comments ({comments.length})</h2>
          {comments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">No comments yet.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <button onClick={() => seek(c.timestamp_sec)} className="rounded-md bg-indigo-400/10 px-2 py-0.5 font-medium tabular-nums text-indigo-300 hover:bg-indigo-400/20">{fmtTime(c.timestamp_sec)}</button>
                    <span className="text-zinc-300">{c.by_client ? c.author_name : `${c.author_name} (editor)`}</span>
                    {c.status === "resolved" && <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300">resolved</span>}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm text-zinc-200">{c.body}</p>
                </li>
              ))}
            </ul>
          )}

          {!approval && video && (
            <div className={`${card} space-y-3 p-4`}>
              <RevisionTracker used={project.revisions_used} limit={project.revision_limit} />
              <label htmlFor="note" className="block text-sm text-zinc-300">Request changes</label>
              <textarea id="note" rows={3} className={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should the editor change?" />
              <button className={`${btn} w-full`} disabled={busy} onClick={requestChanges}>Request changes</button>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-50"
                disabled={busy} onClick={approve}>Approve Final Video</button>
            </div>
          )}
        </aside>
      </div>
    </ClientReviewLayout>
  );
}
