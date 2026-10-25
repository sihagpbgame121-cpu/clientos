"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import YouTubePlayer from "./YouTubePlayer";
import type { PlayerHandle } from "@/lib/types";

type Props = { youtubeId?: string | null; src?: string; onTime: (t: number) => void; onDuration: (d: number) => void };

const MediaPlayer = forwardRef<PlayerHandle, Props>(function MediaPlayer({ youtubeId, src, onTime, onDuration }, ref) {
  const vref = useRef<HTMLVideoElement>(null);
  const yref = useRef<PlayerHandle>(null);
  useImperativeHandle(ref, () => ({
    seek: (t: number) => { if (youtubeId) yref.current?.seek(t); else if (vref.current) vref.current.currentTime = t; },
  }), [youtubeId]);
  if (youtubeId) return <YouTubePlayer ref={yref} videoId={youtubeId} onTime={onTime} onDuration={onDuration} />;
  return <VideoPlayer src={src ?? ""} videoRef={vref} onTime={onTime} onDuration={onDuration} />;
});
export default MediaPlayer;
