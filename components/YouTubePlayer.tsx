"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { PlayerHandle } from "@/lib/types";

declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void } }
let apiPromise: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return (apiPromise ??= new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }));
}

const YouTubePlayer = forwardRef<PlayerHandle, { videoId: string; onTime: (t: number) => void; onDuration: (d: number) => void }>(
  function YouTubePlayer({ videoId, onTime, onDuration }, ref) {
    const box = useRef<HTMLDivElement>(null);
    const player = useRef<any>(null);
    const cb = useRef({ onTime, onDuration });
    cb.current = { onTime, onDuration };
    useImperativeHandle(ref, () => ({ seek: (t: number) => player.current?.seekTo?.(t, true) }), []);

    useEffect(() => {
      let dead = false;
      let timer: ReturnType<typeof setInterval> | undefined;
      loadApi().then(() => {
        if (dead || !box.current) return;
        const mount = document.createElement("div");
        box.current.innerHTML = "";
        box.current.appendChild(mount);
        player.current = new window.YT.Player(mount, {
          videoId, host: "https://www.youtube-nocookie.com",
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => {
              timer = setInterval(() => {
                const p = player.current;
                if (!p?.getCurrentTime) return;
                cb.current.onTime(p.getCurrentTime());
                const d = p.getDuration?.();
                if (d) cb.current.onDuration(d);
              }, 250);
            },
          },
        });
      });
      return () => { dead = true; clearInterval(timer); player.current?.destroy?.(); player.current = null; };
    }, [videoId]);

    return <div ref={box} className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black [&>iframe]:h-full [&>iframe]:w-full" />;
  }
);
export default YouTubePlayer;
