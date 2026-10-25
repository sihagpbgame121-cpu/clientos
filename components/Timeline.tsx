"use client";
import { useRef, MouseEvent, KeyboardEvent } from "react";
import { fmtTime } from "@/lib/types";

export type Marker = { id: string; t: number; resolved: boolean };

export default function Timeline({ duration, current, markers, pending, onSeek }: {
  duration: number; current: number; markers: Marker[]; pending: number | null; onSeek: (t: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = (t: number) => (duration ? Math.min(100, (t / duration) * 100) : 0);

  function click(e: MouseEvent) {
    if (!duration || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(duration, ((e.clientX - r.left) / r.width) * duration)));
  }
  function key(e: KeyboardEvent) {
    if (e.key === "ArrowRight") onSeek(Math.min(duration, current + 1));
    if (e.key === "ArrowLeft") onSeek(Math.max(0, current - 1));
  }
  return (
    <div className="mt-4">
      <div ref={ref} role="slider" tabIndex={0} onClick={click} onKeyDown={key}
        aria-label="Video timeline. Click to place a comment at that time"
        aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(current)}
        className="relative h-3 cursor-pointer rounded-full bg-white/10 outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-indigo-300">
        <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500/60" style={{ width: `${pct(current)}%` }} />
        {markers.map((m) => (
          <span key={m.id} title={fmtTime(m.t)}
            className={`absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full ${m.resolved ? "bg-emerald-400" : "bg-amber-400"}`}
            style={{ left: `${pct(m.t)}%` }} />
        ))}
        {pending !== null && <span className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-white" style={{ left: `${pct(pending)}%` }} />}
      </div>
      <div className="mt-1.5 flex justify-between text-xs tabular-nums text-zinc-500">
        <span>{fmtTime(current)}</span><span>Click the bar to comment at that time</span><span>{fmtTime(duration)}</span>
      </div>
    </div>
  );
}
