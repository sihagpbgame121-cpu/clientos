"use client";
import { useCallback, useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MediaPlayer from "@/components/MediaPlayer";
import YouTubeGuide from "@/components/YouTubeGuide";
import { parseYouTubeId } from "@/lib/youtube";
import Timeline from "@/components/Timeline";
import CommentForm from "@/components/CommentForm";
import CommentThread from "@/components/CommentThread";
import TaskList from "@/components/TaskList";
import RevisionTracker from "@/components/RevisionTracker";
import ApprovalCard from "@/components/ApprovalCard";
import PaymentCard from "@/components/PaymentCard";
import AIChangeDetector from "@/components/AIChangeDetector";
import { useToast } from "@/components/Toast";
import { getSupabase } from "@/lib/supabase";
import {
  ProjectRow, VideoRow, PlayerHandle, CommentRow, TaskRow, TaskStatus, RevisionRow, ApprovalRow, PaymentRow,
  STATUS_LABEL, badge, money, fmtTime,
} from "@/lib/types";
import { btn, btnGhost, card } from "@/lib/ui";

const TABS = ["overview", "review", "tasks", "revisions", "payment"] as const;
type Tab = (typeof TABS)[number];
const MAX_MB = 50; // Supabase free plan per-file limit

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const playerRef = useRef<PlayerHandle>(null);

  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [me, setMe] = useState({ id: "", name: "Editor" });
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [revisions, setRevisions] = useState<RevisionRow[]>([]);
  const [approval, setApproval] = useState<ApprovalRow | null>(null);
  const [payment, setPayment] = useState<PaymentRow | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [src, setSrc] = useState("");
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ytUrl, setYtUrl] = useState("");

  const load = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data: u } = await sb.auth.getUser();
      setMe({ id: u.user?.id ?? "", name: (u.user?.user_metadata?.full_name as string) || u.user?.email || "Editor" });
      const p = await sb.from("projects").select("*, clients(name)").eq("id", id).maybeSingle();
      if (p.error) throw p.error;
      setProject(p.data as ProjectRow | null);
      if (!p.data) return;
      const [v, c, t, r, a, pay] = await Promise.all([
        sb.from("videos").select("*").eq("project_id", id).order("version", { ascending: false }),
        sb.from("comments").select("*").eq("project_id", id).order("timestamp_sec"),
        sb.from("tasks").select("*").eq("project_id", id).order("created_at"),
        sb.from("revisions").select("*").eq("project_id", id).order("created_at", { ascending: false }),
        sb.from("approvals").select("*").eq("project_id", id).maybeSingle(),
        sb.from("payments").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1),
      ]);
      const firstErr = [v, c, t, r, a, pay].find((x) => x.error)?.error;
      if (firstErr) throw firstErr;
      setVideos(v.data as VideoRow[]);
      setComments(c.data as CommentRow[]);
      setTasks(t.data as TaskRow[]);
      setRevisions(r.data as RevisionRow[]);
      setApproval(a.data as ApprovalRow | null);
      setPayment((pay.data?.[0] as PaymentRow) ?? null);
      setVideoId((cur) => cur ?? (v.data?.[0]?.id ?? null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const video = videos.find((v) => v.id === videoId) ?? null;
  useEffect(() => {
    setSrc(""); setCurrent(0); setDuration(0); setPending(null);
    if (!video || video.source === "youtube" || !video.storage_path) return;
    getSupabase().storage.from("videos").createSignedUrl(video.storage_path, 3600).then(({ data, error: e }) => {
      if (e) toast("Could not load video: " + e.message, "err"); else setSrc(data.signedUrl);
    });
  }, [video?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const vComments = useMemo(() => comments.filter((c) => c.video_id === videoId), [comments, videoId]);
  const taskIds = useMemo(() => new Set(tasks.map((t) => t.comment_id).filter(Boolean) as string[]), [tasks]);
  const locked = !!approval;

  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>, ok?: string) => {
    const { error: e } = await fn();
    if (e) toast(e.message, "err"); else { if (ok) toast(ok); await load(); }
  };
  const sb = () => getSupabase();

  function seek(t: number) {
    playerRef.current?.seek(t);
    setCurrent(t); setPending(t);
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !project) return;
    if (!file.type.startsWith("video/")) return toast("Please choose a video file", "err");
    if (file.size > MAX_MB * 1024 * 1024) return toast(`File is over ${MAX_MB} MB (Supabase free plan limit)`, "err");
    setUploading(true);
    try {
      const version = (videos[0]?.version ?? 0) + 1;
      const path = `${me.id}/${project.id}/v${version}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const up = await sb().storage.from("videos").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const ins = await sb().from("videos").insert({ project_id: project.id, version, storage_path: path }).select("id").single();
      if (ins.error) throw ins.error;
      setVideoId(ins.data.id);
      toast(`Version ${version} uploaded`);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "err");
    } finally { setUploading(false); }
  }

  async function addYoutube() {
    const ytId = parseYouTubeId(ytUrl);
    if (!ytId) return toast("That doesn't look like a YouTube link", "err");
    const version = (videos[0]?.version ?? 0) + 1;
    const ins = await sb().from("videos").insert({ project_id: id, version, source: "youtube", youtube_id: ytId }).select("id").single();
    if (ins.error) return toast(ins.error.message, "err");
    setYtUrl(""); setVideoId(ins.data.id);
    toast(`Version ${version} added from YouTube`);
    await load();
  }

  const addComment = (body: string) => run(() => sb().from("comments").insert({
    project_id: id, video_id: videoId, user_id: me.id, author_name: me.name,
    timestamp_sec: Number((pending ?? current).toFixed(2)), body,
  }), "Comment added").then(() => setPending(null));

  const toTask = (c: CommentRow) => run(() => sb().from("tasks").insert({
    project_id: id, comment_id: c.id, title: c.body.slice(0, 80), description: c.body, timestamp_sec: c.timestamp_sec,
  }), "Task created");

  const shareUrl = project && typeof window !== "undefined" ? `${location.origin}/review/${project.review_slug}` : "";
  const copyLink = async () => { await navigator.clipboard.writeText(shareUrl); toast("Review link copied"); };

  if (loading) return <DashboardLayout><div className="h-40 animate-pulse rounded-2xl bg-white/5" /></DashboardLayout>;
  if (error || !project)
    return (
      <DashboardLayout>
        <div role="alert" className={`${card} p-10 text-center`}>
          <p className="font-medium">{error || "Project not found, or you don't have access."}</p>
          <Link href="/dashboard" className={`${btn} mt-4`}>Back to dashboard</Link>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"><ArrowLeft size={14} /> Dashboard</Link>
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="break-words text-2xl font-semibold tracking-tight">{project.name}</h1>
          <span className={`rounded-full px-2.5 py-1 text-xs ${badge[project.status]}`}>{STATUS_LABEL[project.status]}</span>
        </div>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-400">
          <span>Client: <span className="text-zinc-200">{project.clients?.name ?? "—"}</span></span>
          <span>Price: <span className="text-zinc-200">{money(Number(project.price), project.currency)}</span></span>
          <span>Deadline: <span className="text-zinc-200">{project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "None"}</span></span>
        </p>
      </header>

      <div role="tablist" aria-label="Project sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm capitalize outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300 ${tab === t ? "border-b-2 border-indigo-400 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          <RevisionTracker used={revisions.length} limit={project.revision_limit} />
          <ApprovalCard approval={approval} />
          <div className={`${card} p-5 md:col-span-2`}>
            <p className="text-sm text-zinc-400">Client review link</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-white/5 px-3 py-2 text-xs text-zinc-300">{shareUrl}</code>
              <button className={btnGhost} onClick={copyLink}><Copy size={14} /> Copy</button>
              {project.status === "active" && !locked && (
                <button className={btn} onClick={() => run(() => sb().from("projects").update({ status: "awaiting_approval" }).eq("id", id), "Marked as awaiting approval")}>Send for approval</button>
              )}
            </div>
            
          </div>
        </div>
      )}

      {tab === "review" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            {video && (video.source === "youtube" || src) ? (
              <>
                <MediaPlayer ref={playerRef} youtubeId={video.source === "youtube" ? video.youtube_id : null} src={src} onTime={setCurrent} onDuration={setDuration} />
                <Timeline duration={duration} current={current} pending={pending} onSeek={seek}
                  markers={vComments.map((c) => ({ id: c.id, t: c.timestamp_sec, resolved: c.status === "resolved" }))} />
              </>
            ) : video ? (
              <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />
            ) : (
              <div className={`${card} flex aspect-video flex-col items-center justify-center gap-2 p-6 text-center`}>
                <Upload size={28} className="text-zinc-500" />
                <p className="font-medium">No video yet</p>
                <p className="text-sm text-zinc-400">Upload your first cut to start collecting feedback.</p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className={`${btn} cursor-pointer ${uploading || locked ? "pointer-events-none opacity-50" : ""}`}>
                <Upload size={16} /> {uploading ? "Uploading…" : video ? "Upload new version" : "Upload video"}
                <input type="file" accept="video/*" className="sr-only" onChange={upload} disabled={uploading || locked} />
              </label>
              {videos.length > 1 && (
                <select aria-label="Video version" value={videoId ?? ""} onChange={(e) => setVideoId(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm">
                  {videos.map((v) => <option key={v.id} value={v.id} className="bg-zinc-900">Version {v.version}</option>)}
                </select>
              )}
              <span className="text-xs text-zinc-500">Max {MAX_MB} MB on the free plan</span>
            </div>
            {!locked && (
              <div className="mt-4">
                <label htmlFor="yt" className="mb-1.5 block text-sm text-zinc-300">Big video? Paste an unlisted YouTube link</label>
                <div className="flex gap-2">
                  <input id="yt" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="https://youtu.be/..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30" />
                  <button className={btnGhost} onClick={addYoutube}>Add YouTube link</button>
                </div>
              </div>
            )}
            {video?.source === "youtube" && video.youtube_id && (
              <a href={`https://www.youtube.com/watch?v=${video.youtube_id}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-indigo-300 hover:underline">Open on YouTube ↗</a>
            )}
            <YouTubeGuide />
          </div>
          <aside className="space-y-5" aria-label="Comments">
            {video && !locked && <CommentForm ts={pending ?? current} onSubmit={addComment} />}
            {locked && <p className="rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-300">Approved. Comments are locked.</p>}
            <h2 className="text-sm font-medium text-zinc-300">Comments ({vComments.length})</h2>
            <CommentThread comments={vComments} meId={me.id} version={video?.version ?? 1} taskIds={taskIds} onSeek={seek}
              onResolve={(c) => run(() => sb().from("comments").update({ status: c.status === "open" ? "resolved" : "open" }).eq("id", c.id))}
              onEdit={(c, body) => run(() => sb().from("comments").update({ body }).eq("id", c.id), "Comment updated")}
              onDelete={(c) => run(() => sb().from("comments").delete().eq("id", c.id), "Comment deleted")}
              onToTask={toTask} />
          </aside>
        </div>
      )}

      {tab === "tasks" && (
        <div className="space-y-6">
          <AIChangeDetector projectId={id} onCreated={load} />
          <TaskList tasks={tasks} onStatus={(t, s: TaskStatus) => run(() => sb().from("tasks").update({ status: s }).eq("id", t.id))} />
        </div>
      )}

      {tab === "revisions" && (
        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          <RevisionTracker used={revisions.length} limit={project.revision_limit} />
          <div className={`${card} p-5`}>
            <p className="mb-3 text-sm text-zinc-400">Revision requests</p>
            {revisions.length === 0 ? <p className="text-sm text-zinc-500">No revision requests yet.</p> : (
              <ul className="space-y-2">
                {revisions.map((r, i) => (
                  <li key={r.id} className="rounded-xl border border-white/10 p-3 text-sm">
                    <span className="text-zinc-500">#{revisions.length - i} · {new Date(r.created_at).toLocaleString("en-IN")}</span>
                    <p className="mt-1 break-words text-zinc-200">{r.note || "Changes requested"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "payment" && (
        <PaymentCard amount={Number(project.price)} currency={project.currency} payment={payment}
          onCreate={() => run(() => sb().from("payments").insert({ project_id: id, amount: project.price, currency: project.currency }), "Invoice created (mock)")}
          onPaid={() => payment && run(() => sb().from("payments").update({ status: "paid" }).eq("id", payment.id), "Marked as paid (mock)")} />
      )}
    </DashboardLayout>
  );
}
